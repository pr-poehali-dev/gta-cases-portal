'''
Business: Открытие кейса с генерацией промокода
Args: event с httpMethod, body (JSON с user_id, case_id)
Returns: HTTP response с выпавшим предметом и промокодом
'''
import json
import os
import random
import string
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def generate_promo_code(length: int = 12) -> str:
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

def select_item_by_chance(items: list) -> dict:
    total_chance = sum(float(item['drop_chance']) for item in items)
    rand = random.uniform(0, total_chance)
    
    current = 0
    for item in items:
        current += float(item['drop_chance'])
        if rand <= current:
            return item
    
    return items[-1]

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    user_id = body_data.get('user_id')
    case_id = body_data.get('case_id')
    
    if not user_id or not case_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'user_id and case_id required'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cursor.execute("SELECT balance FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        if not user:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'User not found'})
            }
        
        cursor.execute("SELECT price FROM cases WHERE id = %s", (case_id,))
        case = cursor.fetchone()
        if not case:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Case not found'})
            }
        
        balance = float(user['balance'])
        price = float(case['price'])
        
        if balance < price:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Insufficient balance'})
            }
        
        cursor.execute("""
            SELECT id, name, description, rarity, drop_chance, image_url
            FROM case_items
            WHERE case_id = %s
        """, (case_id,))
        
        items = cursor.fetchall()
        if not items:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Case has no items'})
            }
        
        won_item = select_item_by_chance(items)
        promo_code = generate_promo_code()
        
        cursor.execute("""
            INSERT INTO promocodes (user_id, case_id, item_id, promo_code, item_name)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
        """, (user_id, case_id, won_item['id'], promo_code, won_item['name']))
        
        cursor.execute("""
            UPDATE users SET balance = balance - %s WHERE id = %s
        """, (price, user_id))
        
        conn.commit()
        
        cursor.execute("SELECT balance FROM users WHERE id = %s", (user_id,))
        new_balance = float(cursor.fetchone()['balance'])
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'item': {
                    'id': won_item['id'],
                    'name': won_item['name'],
                    'description': won_item['description'],
                    'rarity': won_item['rarity'],
                    'image_url': won_item['image_url']
                },
                'promo_code': promo_code,
                'new_balance': new_balance
            }, default=str)
        }
    
    finally:
        cursor.close()
        conn.close()
