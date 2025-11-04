'''
Business: Авторизация и регистрация пользователей
Args: event с httpMethod, body (JSON с username, password)
Returns: HTTP response с токеном или ошибкой
'''
import json
import os
import hashlib
import hmac
from typing import Dict, Any
import psycopg2

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
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
    action = body_data.get('action')
    username = body_data.get('username', '').strip()
    password = body_data.get('password', '')
    
    if not username or not password:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Username and password required'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor()
    
    try:
        if action == 'register':
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            email = body_data.get('email', f'{username}@gta5rp.local')
            
            cursor.execute(
                "SELECT id FROM users WHERE username = %s",
                (username,)
            )
            if cursor.fetchone():
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Username already exists'})
                }
            
            cursor.execute(
                "INSERT INTO users (username, password_hash, email, balance) VALUES (%s, %s, %s, 1000.00) RETURNING id, is_admin",
                (username, password_hash, email)
            )
            user_id, is_admin = cursor.fetchone()
            conn.commit()
            
            token = f"{user_id}:{hashlib.sha256(f'{user_id}{username}{password_hash}'.encode()).hexdigest()}"
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'token': token,
                    'user': {
                        'id': user_id,
                        'username': username,
                        'balance': 1000.00,
                        'is_admin': is_admin
                    }
                })
            }
        
        elif action == 'login':
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            cursor.execute(
                "SELECT id, username, balance, is_admin FROM users WHERE username = %s AND password_hash = %s",
                (username, password_hash)
            )
            user = cursor.fetchone()
            
            if not user:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid credentials'})
                }
            
            user_id, username, balance, is_admin = user
            token = f"{user_id}:{hashlib.sha256(f'{user_id}{username}{password_hash}'.encode()).hexdigest()}"
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'token': token,
                    'user': {
                        'id': user_id,
                        'username': username,
                        'balance': float(balance),
                        'is_admin': is_admin
                    }
                })
            }
        
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid action'})
            }
    
    finally:
        cursor.close()
        conn.close()
