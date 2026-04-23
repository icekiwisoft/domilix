# Domilix API Swagger Documentation

`json
{
  "openapi": "3.0.0",
  "paths": {
    "/": {
      "get": {
        "operationId": "AppController_getStats",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Global statistics payload"
          }
        },
        "summary": "Get public platform statistics",
        "tags": [
          "System"
        ]
      }
    },
    "/health": {
      "get": {
        "operationId": "AppController_getHealth",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Health status payload"
          }
        },
        "summary": "Check backend health status",
        "tags": [
          "System"
        ]
      }
    },
    "/auth/register": {
      "post": {
        "operationId": "AuthController_register",
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/RegisterDto"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "User registered successfully"
          }
        },
        "summary": "Register a new user",
        "tags": [
          "Auth"
        ]
      }
    },
    "/auth/login": {
      "post": {
        "operationId": "AuthController_login",
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/LoginDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Authentication successful"
          }
        },
        "summary": "Authenticate a user",
        "tags": [
          "Auth"
        ]
      }
    },
    "/auth/refresh": {
      "post": {
        "operationId": "AuthController_refresh",
        "parameters": [],
        "responses": {
          "201": {
            "description": ""
          }
        },
        "summary": "Refresh an expired access token",
        "tags": [
          "Auth"
        ]
      }
    },
    "/auth/verifyPhone/{user_id}": {
      "post": {
        "operationId": "AuthController_verifyPhone",
        "parameters": [
          {
            "name": "user_id",
            "required": true,
            "in": "path",
            "schema": {
              "example": "1",
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/VerifyPhoneDto"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": ""
          }
        },
        "summary": "Verify phone number using code",
        "tags": [
          "Auth"
        ]
      }
    },
    "/auth/resendVerificationCode/{user_id}": {
      "post": {
        "operationId": "AuthController_resendVerificationCode",
        "parameters": [
          {
            "name": "user_id",
            "required": true,
            "in": "path",
            "schema": {
              "example": "1",
              "type": "string"
            }
          }
        ],
        "responses": {
          "201": {
            "description": ""
          }
        },
        "summary": "Resend phone verification code",
        "tags": [
          "Auth"
        ]
      }
    },
    "/auth/logout": {
      "post": {
        "operationId": "AuthController_logout",
        "parameters": [],
        "responses": {
          "201": {
            "description": ""
          }
        },
        "security": [
          {
            "bearer": []
          }
        ],
        "summary": "Logout current user",
        "tags": [
          "Auth"
        ]
      }
    },
    "/auth/me": {
      "get": {
        "operationId": "AuthController_me",
        "parameters": [],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "bearer": []
          }
        ],
        "summary": "Get current authenticated profile",
        "tags": [
          "Auth"
        ]
      },
      "put": {
        "operationId": "AuthController_updateProfile",
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateProfileDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "bearer": []
          }
        ],
        "summary": "Update current authenticated profile",
        "tags": [
          "Auth"
        ]
      }
    },
    "/auth/announcer-profile": {
      "put": {
        "operationId": "AuthController_updateAnnouncerProfilePut",
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "multipart/form-data": {
              "schema": {
                "type": "object",
                "properties": {
                  "company_name": {
                    "type": "string"
                  },
                  "bio": {
                    "type": "string"
                  },
                  "professional_phone": {
                    "type": "string"
                  },
                  "avatar": {
                    "type": "string",
                    "format": "binary"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "bearer": []
          }
        ],
        "summary": "Update announcer profile with optional avatar",
        "tags": [
          "Auth"
        ]
      },
      "post": {
        "operationId": "AuthController_updateAnnouncerProfilePost",
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "multipart/form-data": {
              "schema": {
                "type": "object",
                "properties": {
                  "company_name": {
                    "type": "string"
                  },
                  "bio": {
                    "type": "string"
                  },
                  "professional_phone": {
                    "type": "string"
                  },
                  "avatar": {
                    "type": "string",
                    "format": "binary"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": ""
          }
        },
        "security": [
          {
            "bearer": []
          }
        ],
        "summary": "Fallback POST endpoint for announcer profile update",
        "tags": [
          "Auth"
        ]
      }
    },
    "/auth/sendEmail": {
      "post": {
        "operationId": "AuthController_sendEmail",
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/SendResetLinkDto"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": ""
          }
        },
        "summary": "Send password reset code by email",
        "tags": [
          "Auth"
        ]
      }
    },
    "/auth/resetPassword": {
      "post": {
        "operationId": "AuthController_resetPassword",
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ResetPasswordDto"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": ""
          }
        },
        "summary": "Reset password using verification code",
        "tags": [
          "Auth"
        ]
      }
    },
    "/auth/changePassword": {
      "post": {
        "operationId": "AuthController_changePassword",
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ChangePasswordDto"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": ""
          }
        },
        "security": [
          {
            "bearer": []
          }
        ],
        "summary": "Change current user password",
        "tags": [
          "Auth"
        ]
      }
    },
    "/broadcasts": {
      "get": {
        "operationId": "BroadcastsController_index",
        "parameters": [
          {
            "name": "include_inactive",
            "required": false,
            "in": "query",
            "description": "Set true to include inactive broadcasts",
            "schema": {
              "example": false,
              "type": "boolean"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "summary": "List homepage broadcasts",
        "tags": [
          "Broadcasts"
        ]
      },
      "post": {
        "operationId": "BroadcastsController_create",
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateBroadcastDto"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": ""
          }
        },
        "security": [
          {
            "bearer": []
          }
        ],
        "summary": "Create a broadcast (admin)",
        "tags": [
          "Broadcasts"
        ]
      }
    },
    "/broadcasts/{id}": {
      "get": {
        "operationId": "BroadcastsController_show",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "example": "1",
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "summary": "Get broadcast details",
        "tags": [
          "Broadcasts"
        ]
      },
      "put": {
        "operationId": "BroadcastsController_update",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "example": "1",
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateBroadcastDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "bearer": []
          }
        ],
        "summary": "Update a broadcast (admin)",
        "tags": [
          "Broadcasts"
        ]
      },
      "delete": {
        "operationId": "BroadcastsController_destroy",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "example": "1",
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "bearer": []
          }
        ],
        "summary": "Delete a broadcast (admin)",
        "tags": [
          "Broadcasts"
        ]
      }
    },
    "/announces": {
      "get": {
        "operationId": "AdsController_index",
        "parameters": [
          {
            "name": "AnnouncerId",
            "required": false,
            "in": "query",
            "schema": {
              "example": "announcer-uuid",
              "type": "string"
            }
          },
          {
            "name": "search",
            "required": false,
            "in": "query",
            "schema": {
              "example": "Douala",
              "type": "string"
            }
          },
          {
            "name": "type",
            "required": false,
            "in": "query",
            "schema": {
              "type": "string",
              "enum": [
                "furniture",
                "realestate"
              ]
            }
          },
          {
            "name": "orderBy",
            "required": false,
            "in": "query",
            "schema": {
              "example": "price",
              "type": "string"
            }
          },
          {
            "name": "liked",
            "required": false,
            "in": "query",
            "schema": {
              "example": "1",
              "type": "string"
            }
          },
          {
            "name": "budget_min",
            "required": false,
            "in": "query",
            "schema": {
              "example": "50000",
              "type": "string"
            }
          },
          {
            "name": "budget_max",
            "required": false,
            "in": "query",
            "schema": {
              "example": "300000",
              "type": "string"
            }
          },
          {
            "name": "category_id",
            "required": false,
            "in": "query",
            "schema": {
              "example": [
                "1",
                "2"
              ],
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          },
          {
            "name": "ad_type",
            "required": false,
            "in": "query",
            "schema": {
              "type": "string",
              "enum": [
                "location",
                "sale"
              ]
            }
          },
          {
            "name": "city",
            "required": false,
            "in": "query",
            "schema": {
              "example": "Douala",
              "type": "string"
            }
          },
          {
            "name": "address",
            "required": false,
            "in": "query",
            "schema": {
              "example": "Bonapriso",
              "type": "string"
            }
          },
          {
            "name": "adress",
            "required": false,
            "in": "query",
            "schema": {
              "example": "Bonapriso",
              "type": "string"
            }
          },
          {
            "name": "devise",
            "required": false,
            "in": "query",
            "schema": {
              "example": "XOF",
              "type": "string"
            }
          },
          {
            "name": "period",
            "required": false,
            "in": "query",
            "schema": {
              "example": "month",
              "type": "string"
            }
          },
          {
            "name": "bedroom_min",
            "required": false,
            "in": "query",
            "schema": {
              "example": "1",
              "type": "string"
            }
          },
          {
            "name": "bedroom_max",
            "required": false,
            "in": "query",
            "schema": {
              "example": "4",
              "type": "string"
            }
          },
          {
            "name": "amenities",
            "required": false,
            "in": "query",
            "schema": {
              "example": [
                "garage",
                "pool"
              ],
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          },
          {
            "name": "standing",
            "required": false,
            "in": "query",
            "schema": {
              "type": "string",
              "enum": [
                "standard",
                "confort",
                "haut_standing"
              ]
            }
          },
          {
            "name": "unlocked",
            "required": false,
            "in": "query",
            "schema": {
              "example": "1",
              "type": "string"
            }
          },
          {
            "name": "likeAdmin",
            "required": false,
            "in": "query",
            "schema": {
              "example": "1",
              "type": "string"
            }
          },
          {
            "name": "page",
            "required": false,
            "in": "query",
            "schema": {
              "$ref": "#/components/schemas/Object"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "summary": "List announces with filters and pagination",
        "tags": [
          "Ads"
        ]
      },
      "post": {
        "operationId": "AdsController_create",
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "multipart/form-data": {
              "schema": {
                "type": "object",
                "properties": {
                  "type": {
                    "type": "string",
                    "enum": [
                      "realestate",
                      "furniture"
                    ]
                  },
                  "price": {
                    "type": "string"
                  },
                  "ad_type": {
                    "type": "string",
                    "enum": [
                      "location",
                      "sale"
                    ]
                  },
                  "category_id": {
                    "type": "string"
                  },
                  "description": {
                    "type": "string"
                  },
                  "address": {
                    "type": "string"
                  },
                  "city": {
                    "type": "string"
                  },
                  "state": {
                    "type": "string"
                  },
                  "country": {
                    "type": "string"
                  },
                  "zip": {
                    "type": "string"
                  },
                  "medias[]": {
                    "type": "array",
                    "items": {
                      "type": "string",
                      "format": "binary"
                    }
                  }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": ""
          }
        },
        "security": [
          {
            "bearer": []
          }
        ],
        "summary": "Create a new announce with optional uploaded medias",
        "tags": [
          "Ads"
        ]
      }
    },
    "/announces/{id}": {
      "get": {
        "operationId": "AdsController_show",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "example": "1",
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "summary": "Get announce details",
        "tags": [
          "Ads"
        ]
      },
      "put": {
        "operationId": "AdsController_update",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "example": "1",
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "bearer": []
          }
        ],
        "summary": "Update an announce",
        "tags": [
          "Ads"
        ]
      },
      "delete": {
        "operationId": "AdsController_destroy",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "example": "1",
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "bearer": []
          }
        ],
        "summary": "Delete an announce",
        "tags": [
          "Ads"
        ]
      }
    },
    "/cities": {
      "get": {
        "operationId": "AdsController_cities",
        "parameters": [
          {
            "name": "search",
            "required": false,
            "in": "query",
            "schema": {
              "example": "Douala",
              "type": "string"
            }
          },
          {
            "name": "country",
            "required": false,
            "in": "query",
            "schema": {
              "example": "CM",
              "type": "string"
            }
          },
          {
            "name": "ad_type",
            "required": false,
            "in": "query",
            "schema": {
              "type": "string",
              "enum": [
                "location",
                "sale"
              ]
            }
          },
          {
            "name": "type",
            "required": false,
            "in": "query",
            "schema": {
              "type": "string",
              "enum": [
                "realestate",
                "furniture"
              ]
            }
          },
          {
            "name": "category_id",
            "required": false,
            "in": "query",
            "schema": {
              "example": [
                "1",
                "2"
              ],
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          },
          {
            "name": "limit",
            "required": false,
            "in": "query",
            "schema": {
              "example": "8",
              "type": "string"
            }
          },
          {
            "name": "order_by",
            "required": false,
            "in": "query",
            "schema": {
              "type": "string",
              "enum": [
                "name",
                "count"
              ]
            }
          },
          {
            "name": "order",
            "required": false,
            "in": "query",
            "schema": {
              "type": "string",
              "enum": [
                "asc",
                "desc"
              ]
            }
          },
          {
            "name": "with_count",
            "required": false,
            "in": "query",
            "schema": {
              "$ref": "#/components/schemas/Object"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "summary": "List cities having announces",
        "tags": [
          "Ads"
        ]
      }
    },
    "/announces/{id}/like": {
      "patch": {
        "operationId": "AdsController_toggleLike",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "example": "1",
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "bearer": []
          }
        ],
        "summary": "Like or unlike an announce",
        "tags": [
          "Ads"
        ]
      }
    },
    "/announces/{id}/unlock": {
      "post": {
        "operationId": "AdsController_unlock",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "example": "1",
              "type": "string"
            }
          }
        ],
        "responses": {
          "201": {
            "description": ""
          }
        },
        "security": [
          {
            "bearer": []
          }
        ],
        "summary": "Unlock an announce with available credits",
        "tags": [
          "Ads"
        ]
      }
    },
    "/addresses/search": {
      "get": {
        "operationId": "AddressesController_search",
        "parameters": [
          {
            "name": "query",
            "required": true,
            "in": "query",
            "schema": {
              "example": "douala",
              "type": "string"
            }
          },
          {
            "name": "proximity",
            "required": false,
            "in": "query",
            "schema": {
              "example": [
                9.7,
                4.05
              ],
              "type": "array",
              "items": {
                "type": "number"
              }
            }
          },
          {
            "name": "limit",
            "required": false,
            "in": "query",
            "schema": {
              "example": 5,
              "type": "number"
            }
          },
          {
            "name": "types",
            "required": false,
            "in": "query",
            "schema": {
              "example": [
                "place",
                "address"
              ],
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          },
          {
            "name": "country",
            "required": false,
            "in": "query",
            "schema": {
              "example": "cm",
              "type": "string"
            }
          },
          {
            "name": "language",
            "required": false,
            "in": "query",
            "schema": {
              "example": "fr",
              "type": "string"
            }
          },
          {
            "name": "bbox",
            "required": false,
            "in": "query",
            "schema": {
              "example": [
                8.5,
                3.8,
                11,
                5
              ],
              "type": "array",
              "items": {
                "type": "number"
              }
            }
          },
          {
            "name": "autocomplete",
            "required": false,
            "in": "query",
            "schema": {
              "example": true,
              "type": "boolean"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Address suggestions"
          }
        },
        "summary": "Search addresses with Mapbox geocoding",
        "tags": [
          "Addresses"
        ]
      }
    },
    "/addresses/reverse-geocode": {
      "get": {
        "operationId": "AddressesController_reverseGeocode",
        "parameters": [
          {
            "name": "longitude",
            "required": true,
            "in": "query",
            "schema": {
              "example": 9.7,
              "type": "number"
            }
          },
          {
            "name": "latitude",
            "required": true,
            "in": "query",
            "schema": {
              "example": 4.05,
              "type": "number"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "summary": "Resolve address from coordinates",
        "tags": [
          "Addresses"
        ]
      }
    },
    "/users": {
      "get": {
        "operationId": "UsersController_index",
        "parameters": [
          {
            "name": "page",
            "required": true,
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "summary": "List users",
        "tags": [
          "Users"
        ]
      }
    },
    "/users/{id}": {
      "get": {
        "operationId": "UsersController_show",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "example": "1",
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "summary": "Get a user by id",
        "tags": [
          "Users"
        ]
      },
      "put": {
        "operationId": "UsersController_update",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "example": "1",
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateUserDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": ""
          }
        },
        "summary": "Update a user",
        "tags": [
          "Users"
        ]
      },
      "delete": {
        "operationId": "UsersController_destroy",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "example": "1",
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "summary": "Soft delete a user",
        "tags": [
          "Users"
        ]
      }
    },
    "/users/{id}/become-announcer": {
      "patch": {
        "operationId": "UsersController_becomeAnnouncer",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "example": "1",
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "summary": "Create a request for user to become announcer",
        "tags": [
          "Users"
        ]
      }
    },
    "/announcer-requests": {
      "get": {
        "operationId": "AnnouncerRequestsController_index",
        "parameters": [],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "summary": "List announcer requests",
        "tags": [
          "Announcer Requests"
        ]
      },
      "post": {
        "operationId": "AnnouncerRequestsController_store",
        "parameters": [],
        "responses": {
          "201": {
            "description": ""
          }
        },
        "security": [
          {
            "bearer": []
          }
        ],
        "summary": "Create announcer request for current user",
        "tags": [
          "Announcer Requests"
        ]
      }
    },
    "/announcer-requests/{id}": {
      "get": {
        "operationId": "AnnouncerRequestsController_show",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "example": "1",
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "summary": "Get announcer request by id",
        "tags": [
          "Announcer Requests"
        ]
      },
      "put": {
        "operationId": "AnnouncerRequestsController_update",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "example": "1",
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateAnnouncerRequestDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": ""
          }
        },
        "summary": "Update announcer request status",
        "tags": [
          "Announcer Requests"
        ]
      },
      "delete": {
        "operationId": "AnnouncerRequestsController_destroy",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "example": "1",
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "summary": "Delete announcer request",
        "tags": [
          "Announcer Requests"
        ]
      }
    },
    "/categories": {
      "get": {
        "operationId": "CategoriesController_index",
        "parameters": [
          {
            "name": "search",
            "required": false,
            "in": "query",
            "schema": {
              "example": "Apartment",
              "type": "string"
            }
          },
          {
            "name": "type",
            "required": false,
            "in": "query",
            "schema": {
              "type": "string",
              "enum": [
                "furniture",
                "house"
              ]
            }
          },
          {
            "name": "orderBy",
            "required": false,
            "in": "query",
            "schema": {
              "example": "name",
              "type": "string"
            }
          },
          {
            "name": "page",
            "required": false,
            "in": "query",
            "schema": {
              "$ref": "#/components/schemas/Object"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Paginated categories list"
          }
        },
        "summary": "List categories with optional filters",
        "tags": [
          "Categories"
        ]
      }
    },
    "/categories/{id}": {
      "get": {
        "operationId": "CategoriesController_show",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "example": "1",
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "summary": "Get a category by id",
        "tags": [
          "Categories"
        ]
      }
    },
    "/announcers": {
      "get": {
        "operationId": "AnnouncersController_index",
        "parameters": [
          {
            "name": "page",
            "required": false,
            "in": "query",
            "schema": {
              "$ref": "#/components/schemas/Object"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "summary": "List announcers",
        "tags": [
          "Announcers"
        ]
      },
      "post": {
        "operationId": "AnnouncersController_create",
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "multipart/form-data": {
              "schema": {
                "type": "object",
                "properties": {
                  "name": {
                    "type": "string"
                  },
                  "user_id": {
                    "type": "string"
                  },
                  "bio": {
                    "type": "string"
                  },
                  "contact": {
                    "type": "string"
                  },
                  "avatar": {
                    "type": "string",
                    "format": "binary"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": ""
          }
        },
        "security": [
          {
            "bearer": []
          }
        ],
        "summary": "Create an announcer (admin)",
        "tags": [
          "Announcers"
        ]
      }
    },
    "/announcers/{id}": {
      "get": {
        "operationId": "AnnouncersController_show",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "example": "announcer-uuid",
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "summary": "Get announcer details",
        "tags": [
          "Announcers"
        ]
      },
      "put": {
        "operationId": "AnnouncersController_update",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "example": "announcer-uuid",
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "multipart/form-data": {
              "schema": {
                "type": "object",
                "properties": {
                  "name": {
                    "type": "string"
                  },
                  "user_id": {
                    "type": "string"
                  },
                  "bio": {
                    "type": "string"
                  },
                  "contact": {
                    "type": "string"
                  },
                  "avatar": {
                    "type": "string",
                    "format": "binary"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "bearer": []
          }
        ],
        "summary": "Update an announcer (admin)",
        "tags": [
          "Announcers"
        ]
      },
      "delete": {
        "operationId": "AnnouncersController_destroy",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "example": "announcer-uuid",
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "bearer": []
          }
        ],
        "summary": "Delete an announcer (admin)",
        "tags": [
          "Announcers"
        ]
      }
    },
    "/medias": {
      "get": {
        "operationId": "MediasController_index",
        "parameters": [
          {
            "name": "AnnounceId",
            "required": false,
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "AnnouncerId",
            "required": false,
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "page",
            "required": false,
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "summary": "List medias filtered by announce or announcer",
        "tags": [
          "Medias"
        ]
      },
      "post": {
        "operationId": "MediasController_store",
        "parameters": [],
        "responses": {
          "201": {
            "description": ""
          }
        },
        "security": [
          {
            "bearer": []
          }
        ],
        "summary": "Upload medias and optionally attach them to an announce",
        "tags": [
          "Medias"
        ]
      }
    },
    "/medias/{id}": {
      "get": {
        "operationId": "MediasController_show",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "example": "media-uuid",
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "summary": "Get media by id",
        "tags": [
          "Medias"
        ]
      },
      "delete": {
        "operationId": "MediasController_destroy",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "example": "media-uuid",
              "type": "string"
            }
          },
          {
            "name": "AdId",
            "required": false,
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "summary": "Delete a media or detach it from an announce",
        "tags": [
          "Medias"
        ]
      }
    },
    "/announcers/{announcerId}/medias": {
      "get": {
        "operationId": "AnnouncerMediasController_index",
        "parameters": [
          {
            "name": "announcerId",
            "required": true,
            "in": "path",
            "schema": {
              "example": "announcer-uuid",
              "type": "string"
            }
          },
          {
            "name": "page",
            "required": true,
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "summary": "List medias for a specific announcer",
        "tags": [
          "Announcer Medias"
        ]
      }
    },
    "/newsletters": {
      "get": {
        "operationId": "NewslettersController_index",
        "parameters": [],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "summary": "List verified newsletter subscribers",
        "tags": [
          "Newsletters"
        ]
      },
      "post": {
        "operationId": "NewslettersController_store",
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateNewsletterDto"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": ""
          }
        },
        "summary": "Subscribe an email to the newsletter",
        "tags": [
          "Newsletters"
        ]
      }
    },
    "/newsletters/{id}": {
      "get": {
        "operationId": "NewslettersController_show",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "example": "1",
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "summary": "Get newsletter subscriber by id",
        "tags": [
          "Newsletters"
        ]
      },
      "put": {
        "operationId": "NewslettersController_update",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "example": "1",
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateNewsletterDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": ""
          }
        },
        "summary": "Update newsletter subscriber",
        "tags": [
          "Newsletters"
        ]
      },
      "delete": {
        "operationId": "NewslettersController_destroy",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "example": "1",
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "summary": "Delete newsletter subscriber",
        "tags": [
          "Newsletters"
        ]
      }
    },
    "/newsletter/{token}": {
      "get": {
        "operationId": "NewslettersController_verify",
        "parameters": [
          {
            "name": "token",
            "required": true,
            "in": "path",
            "schema": {
              "example": "uuid-token",
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "summary": "Verify newsletter subscription token",
        "tags": [
          "Newsletters"
        ]
      }
    },
    "/notifications": {
      "get": {
        "operationId": "NotificationsController_index",
        "parameters": [
          {
            "name": "unread_only",
            "required": false,
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "per_page",
            "required": false,
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "page",
            "required": false,
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "bearer": []
          }
        ],
        "summary": "List current user notifications",
        "tags": [
          "Notifications"
        ]
      }
    },
    "/notifications/unread-count": {
      "get": {
        "operationId": "NotificationsController_unreadCount",
        "parameters": [],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "bearer": []
          }
        ],
        "summary": "Count unread notifications",
        "tags": [
          "Notifications"
        ]
      }
    },
    "/notifications/{id}/read": {
      "post": {
        "operationId": "NotificationsController_markAsRead",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "example": "1",
              "type": "string"
            }
          }
        ],
        "responses": {
          "201": {
            "description": ""
          }
        },
        "security": [
          {
            "bearer": []
          }
        ],
        "summary": "Mark one notification as read",
        "tags": [
          "Notifications"
        ]
      }
    },
    "/notifications/mark-all-read": {
      "post": {
        "operationId": "NotificationsController_markAllAsRead",
        "parameters": [],
        "responses": {
          "201": {
            "description": ""
          }
        },
        "security": [
          {
            "bearer": []
          }
        ],
        "summary": "Mark all notifications as read",
        "tags": [
          "Notifications"
        ]
      }
    },
    "/notifications/{id}": {
      "delete": {
        "operationId": "NotificationsController_destroy",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "example": "1",
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "bearer": []
          }
        ],
        "summary": "Delete a notification",
        "tags": [
          "Notifications"
        ]
      }
    },
    "/notifications/read/all": {
      "delete": {
        "operationId": "NotificationsController_deleteAllRead",
        "parameters": [],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "bearer": []
          }
        ],
        "summary": "Delete all read notifications",
        "tags": [
          "Notifications"
        ]
      }
    },
    "/subscriptions": {
      "get": {
        "operationId": "SubscriptionsController_index",
        "parameters": [],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "bearer": []
          }
        ],
        "summary": "List current user subscriptions",
        "tags": [
          "Subscriptions"
        ]
      },
      "post": {
        "operationId": "SubscriptionsController_create",
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateSubscriptionDto"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": ""
          }
        },
        "security": [
          {
            "bearer": []
          }
        ],
        "summary": "Create a subscription payment request",
        "tags": [
          "Subscriptions"
        ]
      }
    },
    "/subscriptions/{id}": {
      "get": {
        "operationId": "SubscriptionsController_show",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "example": "1",
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "bearer": []
          }
        ],
        "summary": "Get a subscription by id",
        "tags": [
          "Subscriptions"
        ]
      },
      "delete": {
        "operationId": "SubscriptionsController_destroy",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "example": "1",
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "bearer": []
          }
        ],
        "summary": "Delete a subscription",
        "tags": [
          "Subscriptions"
        ]
      }
    },
    "/webhooks/campay": {
      "get": {
        "operationId": "WebhooksController_campay",
        "parameters": [
          {
            "name": "external_reference",
            "required": true,
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "summary": "Handle Campay webhook confirmation",
        "tags": [
          "Webhooks"
        ]
      }
    }
  },
  "info": {
    "title": "Domilix Backend API",
    "description": "NestJS API documentation for Domilix backend",
    "version": "1.0.0",
    "contact": {}
  },
  "tags": [],
  "servers": [],
  "components": {
    "securitySchemes": {
      "bearer": {
        "scheme": "bearer",
        "bearerFormat": "JWT",
        "type": "http"
      }
    },
    "schemas": {
      "RegisterDto": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "example": "Domilix User"
          },
          "email": {
            "type": "string",
            "example": "user@example.com"
          },
          "phone_number": {
            "type": "string",
            "example": "+237690000000"
          },
          "password": {
            "type": "string",
            "example": "strong-password-123"
          }
        },
        "required": [
          "name",
          "password"
        ]
      },
      "LoginDto": {
        "type": "object",
        "properties": {
          "email": {
            "type": "string",
            "example": "announcer@domilix.com"
          },
          "phone_number": {
            "type": "string",
            "example": "+237698555511"
          },
          "password": {
            "type": "string",
            "example": "domilix2024"
          }
        }
      },
      "VerifyPhoneDto": {
        "type": "object",
        "properties": {
          "verification_code": {
            "type": "string",
            "example": "123456"
          }
        },
        "required": [
          "verification_code"
        ]
      },
      "UpdateProfileDto": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "example": "Domilix User"
          },
          "email": {
            "type": "object",
            "example": "user@example.com"
          },
          "phone_number": {
            "type": "string",
            "example": "+237690000000"
          }
        }
      },
      "SendResetLinkDto": {
        "type": "object",
        "properties": {
          "email": {
            "type": "string",
            "example": "user@example.com"
          }
        },
        "required": [
          "email"
        ]
      },
      "ResetPasswordDto": {
        "type": "object",
        "properties": {
          "email": {
            "type": "string",
            "example": "user@example.com"
          },
          "code": {
            "type": "number",
            "example": 123456
          },
          "password": {
            "type": "string",
            "example": "new-strong-password"
          },
          "password_confirmation": {
            "type": "string",
            "example": "new-strong-password"
          }
        },
        "required": [
          "email",
          "code",
          "password",
          "password_confirmation"
        ]
      },
      "ChangePasswordDto": {
        "type": "object",
        "properties": {
          "old_password": {
            "type": "string",
            "example": "current-password"
          },
          "current_password": {
            "type": "string",
            "example": "current-password"
          },
          "new_password": {
            "type": "string",
            "example": "new-strong-password"
          },
          "new_password_confirmation": {
            "type": "string",
            "example": "new-strong-password"
          }
        },
        "required": [
          "new_password",
          "new_password_confirmation"
        ]
      },
      "CreateBroadcastDto": {
        "type": "object",
        "properties": {
          "title": {
            "type": "string",
            "example": "Pack Pro Agence"
          },
          "subtitle": {
            "type": "string",
            "example": "Publiez en illimite et obtenez plus de visibilite."
          },
          "badge": {
            "type": "string",
            "example": "35% OFF"
          },
          "cta": {
            "type": "string",
            "example": "Voir le pack"
          },
          "image": {
            "type": "string",
            "example": "/storage/broadcasts/promo.jpg"
          },
          "bg": {
            "type": "string",
            "example": "from-amber-500 to-orange-600"
          },
          "action_url": {
            "type": "string",
            "example": "/subscriptions"
          },
          "active": {
            "type": "boolean",
            "example": true
          },
          "position": {
            "type": "number",
            "example": 1
          },
          "starts_at": {
            "type": "string",
            "example": "2026-03-27T00:00:00.000Z"
          },
          "ends_at": {
            "type": "string",
            "example": "2026-12-31T23:59:59.000Z"
          }
        },
        "required": [
          "title"
        ]
      },
      "Object": {
        "type": "object",
        "properties": {}
      },
      "UpdateUserDto": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "example": "Domilix User"
          },
          "email": {
            "type": "string",
            "example": "user@example.com"
          },
          "phone_number": {
            "type": "string",
            "example": "+237690000000"
          },
          "phone_verified": {
            "type": "boolean",
            "example": true
          },
          "is_admin": {
            "type": "boolean",
            "example": false
          }
        },
        "required": [
          "name",
          "email"
        ]
      },
      "UpdateAnnouncerRequestDto": {
        "type": "object",
        "properties": {
          "status": {
            "type": "string",
            "enum": [
              "approved",
              "rejected"
            ]
          }
        },
        "required": [
          "status"
        ]
      },
      "CreateNewsletterDto": {
        "type": "object",
        "properties": {
          "email": {
            "type": "string",
            "example": "user@example.com"
          }
        },
        "required": [
          "email"
        ]
      },
      "UpdateNewsletterDto": {
        "type": "object",
        "properties": {
          "email": {
            "type": "string",
            "example": "user@example.com"
          },
          "verified": {
            "type": "boolean",
            "example": true
          },
          "verification_token": {
            "type": "object",
            "example": null
          }
        }
      },
      "CreateSubscriptionDto": {
        "type": "object",
        "properties": {
          "plan_name": {
            "type": "string",
            "example": "Premium"
          },
          "method": {
            "type": "string",
            "example": "campay"
          },
          "payment_info": {
            "type": "object",
            "example": {
              "phone_number": "+237690000000"
            }
          }
        },
        "required": [
          "plan_name",
          "method",
          "payment_info"
        ]
      }
    }
  }
}
`
