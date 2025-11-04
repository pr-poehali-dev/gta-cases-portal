'''
Business: Админ-панель для управления пользователями, кейсами и предметами
Args: event с httpMethod, body (JSON), headers (X-User-Id для проверки прав)
Returns: HTTP response с результатом операции
'''
import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def check_admin(user_id: int, cursor) -> bool:
    cursor.execute("SELECT is_admin FROM users WHERE id = %s", (user_id,))
    result = cursor.fetchone()
    return result and result['is_admin']

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = event.get('headers', {})
    user_id = headers.get('x-user-id') or headers.get('X-User-Id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if not check_admin(int(user_id), cursor):
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Access denied'})
            }
        
        params = event.get('queryStringParameters', {}) or {}
        action = params.get('action')
        
        if method == 'GET':
            if action == 'users':
                cursor.execute("""
                    SELECT id, username, email, balance, is_admin, created_at
                    FROM users
                    ORDER BY created_at DESC
                """)
                users = [dict(u) for u in cursor.fetchall()]
                for u in users:
                    u['balance'] = float(u['balance'])
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(users, default=str)
                }
            
            elif action == 'stats':
                cursor.execute("SELECT COUNT(*) as total_users FROM users")
                total_users = cursor.fetchone()['total_users']
                
                cursor.execute("SELECT COUNT(*) as total_cases FROM cases")
                total_cases = cursor.fetchone()['total_cases']
                
                cursor.execute("SELECT COUNT(*) as total_promocodes FROM promocodes")
                total_promocodes = cursor.fetchone()['total_promocodes']
                
                cursor.execute("SELECT SUM(balance) as total_balance FROM users")
                total_balance = float(cursor.fetchone()['total_balance'] or 0)
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'total_users': total_users,
                        'total_cases': total_cases,
                        'total_promocodes': total_promocodes,
                        'total_balance': total_balance
                    })
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'update_balance':
                target_user_id = body_data.get('user_id')
                new_balance = body_data.get('balance')
                
                cursor.execute(
                    "UPDATE users SET balance = %s WHERE id = %s",
                    (new_balance, target_user_id)
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True})
                }
            
            elif action == 'create_case':
                name = body_data.get('name')
                description = body_data.get('description')
                price = body_data.get('price')
                rarity = body_data.get('rarity', 'common')
                
                cursor.execute("""
                    INSERT INTO cases (name, description, price, rarity)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id
                """, (name, description, price, rarity))
                
                case_id = cursor.fetchone()['id']
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'case_id': case_id})
                }
            
            elif action == 'update_case':
                case_id = body_data.get('case_id')
                name = body_data.get('name')
                description = body_data.get('description')
                price = body_data.get('price')
                rarity = body_data.get('rarity')
                
                cursor.execute("""
                    UPDATE cases 
                    SET name = %s, description = %s, price = %s, rarity = %s
                    WHERE id = %s
                """, (name, description, price, rarity, case_id))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True})
                }
            
            elif action == 'create_item':
                case_id = body_data.get('case_id')
                name = body_data.get('name')
                description = body_data.get('description')
                rarity = body_data.get('rarity', 'common')
                drop_chance = body_data.get('drop_chance')
                
                cursor.execute("""
                    INSERT INTO case_items (case_id, name, description, rarity, drop_chance)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING id
                """, (case_id, name, description, rarity, drop_chance))
                
                item_id = cursor.fetchone()['id']
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'item_id': item_id})
                }
            
            elif action == 'update_item':
                item_id = body_data.get('item_id')
                name = body_data.get('name')
                description = body_data.get('description')
                rarity = body_data.get('rarity')
                drop_chance = body_data.get('drop_chance')
                
                cursor.execute("""
                    UPDATE case_items
                    SET name = %s, description = %s, rarity = %s, drop_chance = %s
                    WHERE id = %s
                """, (name, description, rarity, drop_chance, item_id))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True})
                }
        
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid action'})
        }
    
    finally:
        cursor.close()
        conn.close()
