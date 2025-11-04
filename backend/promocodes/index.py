'''
Business: Получение и продажа промокодов пользователя
Args: event с httpMethod, queryStringParameters (user_id) или body (promo_id, user_id)
Returns: HTTP response со списком промокодов или результатом продажи
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
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
        
        elif method != 'GET':
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'})
            }
        
        params = event.get('queryStringParameters', {}) or {}
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