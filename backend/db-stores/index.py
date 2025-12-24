"""
API для работы со справочником магазинов
Позволяет получать список магазинов, добавлять, редактировать и удалять магазины
"""
import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    # CORS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    # Подключение к БД
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            # Получить все магазины
            cur.execute("""
                SELECT id, name, district, address, created_at
                FROM stores
                ORDER BY district, name
            """)
            rows = cur.fetchall()
            stores = []
            for row in rows:
                stores.append({
                    'id': str(row[0]),
                    'name': row[1],
                    'district': row[2],
                    'address': row[3],
                    'createdAt': row[4].isoformat() if row[4] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(stores),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            # Добавить магазин
            body = json.loads(event.get('body', '{}'))
            name = body.get('name')
            district = body.get('district')
            address = body.get('address', '')
            
            cur.execute("""
                INSERT INTO stores (name, district, address)
                VALUES (%s, %s, %s)
                RETURNING id, name, district, address, created_at
            """, (name, district, address))
            
            row = cur.fetchone()
            conn.commit()
            
            store = {
                'id': str(row[0]),
                'name': row[1],
                'district': row[2],
                'address': row[3],
                'createdAt': row[4].isoformat() if row[4] else None
            }
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(store),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            # Обновить магазин
            params = event.get('queryStringParameters', {})
            store_id = params.get('id')
            body = json.loads(event.get('body', '{}'))
            
            name = body.get('name')
            district = body.get('district')
            address = body.get('address', '')
            
            cur.execute("""
                UPDATE stores
                SET name = %s, district = %s, address = %s
                WHERE id = %s
                RETURNING id, name, district, address, created_at
            """, (name, district, address, store_id))
            
            row = cur.fetchone()
            conn.commit()
            
            if not row:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Store not found'}),
                    'isBase64Encoded': False
                }
            
            store = {
                'id': str(row[0]),
                'name': row[1],
                'district': row[2],
                'address': row[3],
                'createdAt': row[4].isoformat() if row[4] else None
            }
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(store),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    finally:
        cur.close()
        conn.close()
