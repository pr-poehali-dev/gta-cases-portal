'''
Business: Получение промокодов пользователя
Args: event с httpMethod, queryStringParameters (user_id)
Returns: HTTP response со списком промокодов пользователя
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
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'GET':
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
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cursor.execute("""
            SELECT 
                p.id,
                p.promo_code,
                p.item_name,
                p.is_used,
                p.created_at,
                ci.rarity,
                ci.description,
                c.name as case_name
            FROM promocodes p
            LEFT JOIN case_items ci ON p.item_id = ci.id
            LEFT JOIN cases c ON p.case_id = c.id
            WHERE p.user_id = %s
            ORDER BY p.created_at DESC
        """, (user_id,))
        
        promocodes = cursor.fetchall()
        result = [dict(promo) for promo in promocodes]
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result, default=str)
        }
    
    finally:
        cursor.close()
        conn.close()
