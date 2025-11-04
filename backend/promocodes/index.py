'''
Business: Получение промокодов, продажа системе и маркетплейс между игроками
Args: event с httpMethod, queryStringParameters или body с параметрами
Returns: HTTP response с данными или результатом операции
'''
import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            promo_id = body_data.get('promo_id')
            user_id = body_data.get('user_id')
            
            if not promo_id or not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'promo_id and user_id required'})
                }
            
            cursor.execute("""
                SELECT p.id, p.user_id, p.is_used, c.price
                FROM promocodes p
                JOIN cases c ON p.case_id = c.id
                WHERE p.id = %s
            """, (promo_id,))
            
            promo = cursor.fetchone()
            
            if not promo:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Promocode not found'})
                }
            
            if promo['user_id'] != user_id:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Not your promocode'})
                }
            
            if promo['is_used']:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Promocode already used or sold'})
                }
            
            sell_price = float(promo['price']) * 0.5
            
            cursor.execute("UPDATE users SET balance = balance + %s WHERE id = %s", (sell_price, user_id))
            cursor.execute("UPDATE promocodes SET is_used = TRUE WHERE id = %s", (promo_id,))
            conn.commit()
            
            cursor.execute("SELECT balance FROM users WHERE id = %s", (user_id,))
            new_balance = float(cursor.fetchone()['balance'])
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'sold_for': sell_price,
                    'new_balance': new_balance
                })
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'list_market':
                promo_id = body_data.get('promo_id')
                seller_id = body_data.get('user_id')
                price = body_data.get('price')
                
                if not all([promo_id, seller_id, price]):
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Missing required fields'})
                    }
                
                cursor.execute("""
                    SELECT p.user_id, p.is_used, ci.name, ci.rarity, ci.description
                    FROM promocodes p
                    LEFT JOIN case_items ci ON p.item_id = ci.id
                    WHERE p.id = %s
                """, (promo_id,))
                
                promo = cursor.fetchone()
                if not promo or promo['user_id'] != seller_id or promo['is_used']:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Invalid promocode'})
                    }
                
                cursor.execute("""
                    INSERT INTO marketplace (seller_id, promo_id, price, item_name, item_rarity, item_description)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id
                """, (seller_id, promo_id, price, promo['name'], promo['rarity'], promo['description']))
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True})
                }
            
            elif action == 'buy_market':
                market_id = body_data.get('market_id')
                buyer_id = body_data.get('user_id')
                
                cursor.execute("""
                    SELECT m.seller_id, m.promo_id, m.price, m.is_sold, u.balance
                    FROM marketplace m
                    JOIN users u ON u.id = %s
                    WHERE m.id = %s AND m.is_sold = FALSE
                """, (buyer_id, market_id))
                
                market = cursor.fetchone()
                if not market:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Item not available'})
                    }
                
                if market['seller_id'] == buyer_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Cannot buy your own item'})
                    }
                
                if float(market['balance']) < float(market['price']):
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Insufficient balance'})
                    }
                
                cursor.execute("UPDATE users SET balance = balance - %s WHERE id = %s", (market['price'], buyer_id))
                cursor.execute("UPDATE users SET balance = balance + %s WHERE id = %s", (market['price'], market['seller_id']))
                cursor.execute("UPDATE promocodes SET user_id = %s WHERE id = %s", (buyer_id, market['promo_id']))
                cursor.execute("UPDATE marketplace SET is_sold = TRUE, buyer_id = %s, sold_at = CURRENT_TIMESTAMP WHERE id = %s", (buyer_id, market_id))
                
                conn.commit()
                
                cursor.execute("SELECT balance FROM users WHERE id = %s", (buyer_id,))
                new_balance = float(cursor.fetchone()['balance'])
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'new_balance': new_balance})
                }
        
        elif method != 'GET':
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'})
            }
        
        params = event.get('queryStringParameters', {}) or {}
        action = params.get('action')
        
        if action == 'market':
            cursor.execute("""
                SELECT 
                    m.id,
                    m.price,
                    m.item_name,
                    m.item_rarity,
                    m.item_description,
                    m.created_at,
                    u.username as seller_name
                FROM marketplace m
                JOIN users u ON m.seller_id = u.id
                WHERE m.is_sold = FALSE
                ORDER BY m.created_at DESC
            """)
            
            items = []
            for item in cursor.fetchall():
                item_dict = dict(item)
                item_dict['price'] = float(item_dict['price'])
                items.append(item_dict)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(items, default=str)
            }
        
        user_id = params.get('user_id')
        
        if not user_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'user_id required'})
            }
        
        cursor.execute("""
            SELECT 
                p.id,
                p.promo_code,
                p.item_name,
                p.is_used,
                p.created_at,
                ci.rarity,
                ci.description,
                c.name as case_name,
                c.price as case_price
            FROM promocodes p
            LEFT JOIN case_items ci ON p.item_id = ci.id
            LEFT JOIN cases c ON p.case_id = c.id
            WHERE p.user_id = %s
            ORDER BY p.created_at DESC
        """, (user_id,))
        
        promocodes = cursor.fetchall()
        result = []
        for promo in promocodes:
            promo_dict = dict(promo)
            promo_dict['case_price'] = float(promo_dict['case_price']) if promo_dict['case_price'] else 0
            result.append(promo_dict)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result, default=str)
        }
    
    finally:
        cursor.close()
        conn.close()