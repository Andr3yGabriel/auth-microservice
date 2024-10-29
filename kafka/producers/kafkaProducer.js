const { Kafka } = require('kafkajs');
require('dotenv').config();

const kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID || 'my-app',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

const producer = kafka.producer();

const sendMessage = async (topic, message) => {
    try {
        await producer.connect();
        await producer.send({
            topic,
            messages: [{ value: JSON.stringify(message) }],
        });
        console.log(`Message sent to topic ${topic}`);
    } catch (error) {
        console.error('Error sending message:', error);
    } finally {
        await producer.disconnect();
    }
};

module.exports = sendMessage;
