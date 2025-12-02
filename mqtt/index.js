import mqtt from 'mqtt'

// MQTT 配置（默认配置，可通过构造函数覆盖）
const defaultOptions = {
    clean: true,
    connectTimeout: 4000,
    clientId: 'mqttx-' + Math.random().toString(16).substr(2, 8),
    username: '',
    password: '',
    protocol: 'ws'
}

class MQTTClient {
    /**
     * 构造函数
     * @param {string} brokerUrl - 服务器地址（必填）
     * @param {string} subscribeTopic - 订阅主题（必填）
     * @param {Object} options - 连接配置（可选）
     */
    constructor(brokerUrl = '', subscribeTopic = '', options = {}) {
        this.client = null
        // 合并用户配置和默认配置（用户配置优先级更高）
        this.options = { ...defaultOptions, ...options }
        // 接收传入的 brokerUrl，若无则使用默认值
        this.brokerUrl = brokerUrl
        this.subscribeTopic = subscribeTopic
    }

    connect() {
        // 使用实例的 brokerUrl 和 options 进行连接
        this.client = mqtt.connect(this.brokerUrl, this.options)

        // 连接成功
        this.client.on('connect', () => {
            console.log('MQTT连接成功')
            console.log(`连接地址: ${this.brokerUrl}`)
            this.subscribe(this.subscribeTopic)
        })

        // 错误处理
        this.client.on('error', error => {
            console.error('MQTT连接错误:', error)
            console.error('连接地址:', this.brokerUrl)
        })
    }

    subscribe(topic) {
        if (!this.client) {
            console.warn('MQTT客户端未连接，无法订阅主题')
            return
        }
        this.client.subscribe(topic, { qos: 0 }, err => {
            if (!err) {
                console.log(`Subscribed to ${topic}`)
            } else {
                console.error(`订阅 ${topic} 失败:`, err)
            }
        })
    }

    // 接收消息处理
    onMessage(callback) {
        if (!this.client) {
            console.warn('MQTT客户端未连接，无法注册消息回调')
            return
        }
        this.client.on('message', (topic, message) => {
            callback(topic, message.toString())
        })
    }

    // 发送消息
    publish(topic, message) {
        if (!this.client) {
            console.warn('MQTT客户端未连接，无法发送消息')
            return
        }
        this.client.publish(topic, message, { qos: 0 }, err => {
            if (err) {
                console.error(`发送消息到 ${topic} 失败:`, err)
            }
        })
    }

    disconnect() {
        console.log('MQTT断开连接')
        this.client?.end()
        this.client = null
    }
}

// 也可以导出类，方便用户自定义配置和地址
export default MQTTClient


/**
 *  使用方式：
    import MQTTClient from './mqtt/index.js';
    新建客户端实例：
    const mqttClient = new MQTTClient('wss://broker.emqx.io:8084/mqtt', 'test/topic', {
        username: 'your-username',
        password: 'your-password'
    });
    连接并订阅主题：
    mqttClient.connect();
    接收消息：
    mqttClient.onMessage((topic, message) => {
        console.log(`Received message on ${topic}: ${message}`);
    });
    发送消息：
    mqttClient.publish('test/topic', 'Hello MQTT');
    断开连接：
    mqttClient.disconnect();
 */