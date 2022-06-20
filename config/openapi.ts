import * as dotenv from 'dotenv';
dotenv.config();

export const swDocument = {
    'openapi': '3.0.0',
    'info': {
        'title': 'Express API',
        'version': '1.0.0',
        'description': 'The REST API'
    },
    'servers': [
        {
            'url': `http://${process.env.NODE_SERVER_HOST}:${process.env.NODE_SERVER_PORT}`,
            'description': 'Api Server - http'
        },
        {
            'url': `https://${process.env.NODE_SERVER_HOST}:${process.env.NODE_SERVER_PORT}`,
            'description': 'Api Server - https'
        },
    ],
    'components': {
        'securitySchemes': {
            'bearerAuth': {
                'type': 'http',
                'scheme': 'bearer',
                'bearerFormat': 'JWT'
            }
        },
    },
    'paths': {
        'asd': {

        },
    }
}
