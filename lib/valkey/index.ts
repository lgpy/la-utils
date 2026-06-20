import { ValkeyAuthModule } from './modules';
import Redis, { RedisOptions } from "iovalkey";

class ValkeyClient extends Redis {
	public readonly authModule: ValkeyAuthModule;

	constructor(path: string, options?: RedisOptions) {
		if (options)
			super(path, options);
		else
			super(path)
		this.authModule = new ValkeyAuthModule('auth:', this);
	}
}

export default ValkeyClient;
export * from './modules';
