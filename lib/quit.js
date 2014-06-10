// prints message and kills the process
module.exports = function (message, exitCode) {
    if (typeof exitCode === 'undefined') {
        exitCode = 1;
    }
    if (message) console.log('\n' + message + '\n');
    process.exit(exitCode || 0);
};
