import { IncrementalCache, Queue, TagCache } from "@genezio/nextjs-isr-eu-central-1"

const deployment = process.env["GENEZIO_DOMAIN_NAME"] || "";
const token = (process.env["GENEZIO_CACHE_TOKEN"] || "") + "/_cache/" + (process.env["NEXT_BUILD_ID"] || "");


export default class CacheHandler {
    constructor(options) {
        this.queue = Queue;
        this.incrementalCache = IncrementalCache;
        this.tagCache = TagCache;
    }

    async get(key) {
        try {
            return await this.incrementalCache.get(deployment, token, key);
        } catch (error) {
            return null;
        }
    }

    async set(key, data, options) {
        try {
            await this.incrementalCache.set(deployment, token, key, data, options);
            
            if (options?.tags?.length) {
                await this.tagCache.writeTags(deployment, token, key, options.tags);
            }
        } catch (error) {
            console.error('Cache set error:', error);
        }
    }

    async revalidateTag(tag) {
        try {
            const paths = await this.tagCache.getByTag(deployment, token, tag);
            
            if (paths?.length) {
                await this.queue.send(deployment, token, {
                    type: 'revalidate',
                    paths
                });
            }
        } catch (error) {
            console.error('Tag revalidation error:', error);
        }
    }
}