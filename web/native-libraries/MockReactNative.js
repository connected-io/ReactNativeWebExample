class DeviceEventEmitter {
    static addListener(id, callback) {
        setInterval(() => {
            if (!this.t) {
                this.t = 0;
            }
            this.t += 0.001;

            let rotationRate = {
                x: this.t,
                y: this.t
            };

            callback({
                rotationRate: rotationRate
            });
        }, 100);
    }
}

module.exports = {
    DeviceEventEmitter,
    ...require('react-native-web')
};