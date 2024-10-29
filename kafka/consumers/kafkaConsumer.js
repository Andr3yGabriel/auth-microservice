const { Kafka } = require('kafkajs');
require('dotenv').config();

const kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID || 'my-app',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'auth-service-group' });

const runConsumer = async () => {
    try {
        await consumer.connect();
        console.log('Consumer connected.');

        await consumer.subscribe({ topic: 'auth-events', fromBeginning: true });
        console.log('Consumer subscribed to topic.');

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                console.log(`Received message from topic: ${topic}, partition: ${partition}`);
                const value = JSON.parse(message.value.toString());
                console.log(`Received message: ${value.event} for user ID: ${value.userId}`);

                if(value.event === 'user-registered') {
                    console.log(`Sending welcome email to user with email: ${value.email}`);
                }
            },
        });
    } catch (error) {
        console.error('Error in consumer:', error);
    }
};

module.exports = runConsumer;
