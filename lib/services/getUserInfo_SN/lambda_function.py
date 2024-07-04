import json
import requests
import os

def lambda_handler(event, context):
    # print(event)
    
    # Extract parameters from the event
    params = event['Details']['ContactData']['Attributes']
    customer_id = params['Customer_ID']
    user_id = params['User_ID']
    short_description = params['short_description']
    
    
    if not user_id:
        return {
            'statusCode': 400,
            'body': json.dumps({'message': 'User ID is required'})
        }
        
    caller_id = f"{customer_id}_{user_id}"
    
    
    # caller_id = '98765432_34'
    # ServiceNow credentials
    user_name = os.environ['SERVICENOW_USERNAME']
    password = os.environ['SERVICENOW_PASSWORD']
    host = os.environ['SERVICENOW_HOST']
    auth = (user_name, password)
    
    url = f'https://{host}/api/now/table/sys_user?sysparm_query=user_name={caller_id}'
    print(url)
    
    # Set headers
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    
    try:
        # Make a GET request to fetch user information
        response = requests.get(url, auth=auth, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            print(data)
            
            if 'result' in data and len(data['result']) > 0:
                user_info = data['result'][0]
                name = user_info['name']
                email = user_info['email']
                phone = user_info['phone']
                
                incident_response = createIncident(host, auth, headers, name, email, phone, short_description)
                return {
                    'statusCode': incident_response['statusCode'],
                    'body': incident_response['body']
                }
            else:
                return {
                    'statusCode': 404,
                    'body': json.dumps({'message': 'User not found in ServiceNow'})
                }
        else:
            return {
                'statusCode': response.status_code,
                'body': json.dumps({'message': 'Failed to fetch data from ServiceNow'})
            }
    
    except Exception as e:
        error_message = 'Error: ' + str(e)
        print(error_message)
        return {
            'statusCode': 500,
            'body': json.dumps({'message': error_message})
        }

def createIncident(host, auth, headers, name, email, phone, short_description):
    try:
        incident_data = {
            'caller_id': '98765432_34',
            'short_description': short_description,
            'u_customer_name': name,
            'u_customer_email': email,
            'u_business_phone': phone
        }
        
        servicenow_instance = 'https://' + host
        api_endpoint = '/api/now/table/incident'
        url = servicenow_instance + api_endpoint
        
        response = requests.post(url, auth=auth, headers=headers, json=incident_data)
        response_data = response.json()
        
        if response.status_code == 201:  # HTTP 201 Created
            sys_id = response_data['result']['sys_id']
            number = response_data['result']['number']
            print('Created incident sys_id:', sys_id)
            
            return {
                'statusCode': 200,
                'body': json.dumps({'message': 'Incident created successfully', 'sys_id': sys_id, 'number': number})
            }
        else:
            return {
                'statusCode': response.status_code,
                'body': json.dumps({'message': 'Failed to create Incident', 'response': response_data})
            }
    
    except Exception as e:
        error_message = 'Error: ' + str(e)
        print(error_message)
        return {
            'statusCode': 500,
            'body': json.dumps({'message': error_message})
        }
