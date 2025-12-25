"""
API для работы со справочником товаров
Позволяет получать список товаров, добавлять, редактировать и удалять товары
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
            # Получить все товары
            cur.execute("""
                SELECT id, name, category, min_price, max_price, photo_required, created_at
                FROM products
                ORDER BY category, name
            """)
            rows = cur.fetchall()
            products = []
            for row in rows:
                products.append({
                    'id': str(row[0]),
                    'name': row[1],
                    'category': row[2],
                    'minPrice': float(row[3]),
                    'maxPrice': float(row[4]),
                    'photoRequired': row[5],
                    'createdAt': row[6].isoformat() if row[6] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(products),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            # Добавить товар
            body = json.loads(event.get('body', '{}'))
            name = body.get('name')
            category = body.get('category')
            min_price = body.get('minPrice')
            max_price = body.get('maxPrice')
            photo_required = body.get('photoRequired', False)
            
            cur.execute("""
                INSERT INTO products (name, category, min_price, max_price, photo_required)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id, name, category, min_price, max_price, photo_required, created_at
            """, (name, category, min_price, max_price, photo_required))
            
            row = cur.fetchone()
            conn.commit()
            
            product = {
                'id': str(row[0]),
                'name': row[1],
                'category': row[2],
                'minPrice': float(row[3]),
                'maxPrice': float(row[4]),
                'photoRequired': row[5],
                'createdAt': row[6].isoformat() if row[6] else None
            }
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(product),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            # Обновить товар
            body = json.loads(event.get('body', '{}'))
            product_id = body.get('id')
            
            name = body.get('name')
            category = body.get('category')
            min_price = body.get('minPrice')
            max_price = body.get('maxPrice')
            photo_required = body.get('photoRequired')
            
            cur.execute("""
                UPDATE products
                SET name = %s, category = %s, min_price = %s, max_price = %s, photo_required = %s
                WHERE id = %s
                RETURNING id, name, category, min_price, max_price, photo_required, created_at
            """, (name, category, min_price, max_price, photo_required, product_id))
            
            row = cur.fetchone()
            conn.commit()
            
            if not row:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Product not found'}),
                    'isBase64Encoded': False
                }
            
            product = {
                'id': str(row[0]),
                'name': row[1],
                'category': row[2],
                'minPrice': float(row[3]),
                'maxPrice': float(row[4]),
                'photoRequired': row[5],
                'createdAt': row[6].isoformat() if row[6] else None
            }
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(product),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            # Удалить товар
            body = json.loads(event.get('body', '{}'))
            product_id = body.get('id')
            
            cur.execute("DELETE FROM products WHERE id = %s RETURNING id", (product_id,))
            row = cur.fetchone()
            conn.commit()
            
            if not row:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Product not found'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Product deleted successfully'}),
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