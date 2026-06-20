import { RedisClient, type RedisOptions } from 'bun';
import { ValkeyAuthModule } from './modules';

class ValkeyClient extends RedisClient {
	public readonly authModule: ValkeyAuthModule;

	constructor(url?: string, options?: RedisOptions) {
		super(url, options);
		this.authModule = new ValkeyAuthModule('auth:', this);
	}
}

export default ValkeyClient;
export * from './modules';
