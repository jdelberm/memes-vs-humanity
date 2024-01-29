class ContextLogger {

	log = new require("simple-node-logger").createSimpleLogger({
		timestampFormat: 'YYYY-MM-DD HH:mm:ss'
	});

	context = "";

	setContext = (context) => {this.context = `[ ${context} ] `}

	info = (msg) => { this.log.info(this.context + msg) }
	warn = (msg) => { this.log.warn(this.context + msg) }
	error = (msg) => { this.log.error(this.context + msg) }

}

global.ContextLogger = ContextLogger;