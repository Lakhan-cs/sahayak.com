const otp = () => { return (Math.floor(Math.random() * 9000) + 1000).toString()}

module.exports = otp
