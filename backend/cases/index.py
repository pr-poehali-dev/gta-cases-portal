'''
Business: Получение списка кейсов и их содержимого
Args: event с httpMethod, queryStringParameters (case_id)
Returns: HTTP response со списком кейсов или предметов кейса
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
                'Access-Control-Allow-Headers': 'Content-Type',
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
    case_id = params.get('case_id')
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if case_id:
            cursor.execute(f"""
                SELECT c.*, 
                       json_agg(
                           json_build_object(
                               'id', ci.id,
                               'name', ci.name,
                               'description', ci.description,
                               'rarity', ci.rarity,
                               'drop_chance', ci.drop_chance,
                               'image_url', ci.image_url
                           )
                       ) as items
                FROM t_p36789279_gta_cases_portal.cases c
                LEFT JOIN t_p36789279_gta_cases_portal.case_items ci ON c.id = ci.case_id
                WHERE c.id = {case_id}
                GROUP BY c.id
            """)
            
            case = cursor.fetchone()
            if not case:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Case not found'})
                }
            
            result = dict(case)
            result['price'] = float(result['price'])
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result, default=str)
            }
        else:
            cursor.execute("""
                SELECT id, name, description, price, image_url, rarity, created_at
                FROM t_p36789279_gta_cases_portal.cases
                ORDER BY price ASC
            """)
            
            cases = cursor.fetchall()
            result = []
            for case in cases:
                case_dict = dict(case)
                case_dict['price'] = float(case_dict['price'])
                result.append(case_dict)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result, default=str)
            }
    
    finally:
        cursor.close()
        conn.close()