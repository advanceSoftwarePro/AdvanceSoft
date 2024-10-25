const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Message extends Model {}

Message.init(
    {
        MessageID: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
            field: 'MessageID',
        },
        sender_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'SenderID',
        },
        receiver_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'ReceiverID',
        },
        message_text: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: 'MessageContent',
        },
        timestamp: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'SentAt',
        },
        is_read: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_read',
        },
        reply_to: {
            type: DataTypes.BIGINT,
            allowNull: true,
            field: 'reply_to',
            references: {
                model: {
                    tableName: 'Messages',
                    schema: 'advance'
                },
                key: 'MessageID'
            },
            onDelete: 'CASCADE',
        },
    },
    {
        sequelize,
        tableName: 'Messages',
        schema: 'advance',
        timestamps: false,
    }
);

module.exports = Message;
