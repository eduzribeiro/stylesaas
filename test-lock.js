const locks = {};
const memoryLock = async (name, acquireTimeout, fn) => {
    const previousPromise = locks[name] || Promise.resolve();
    let releaseLock;
    locks[name] = previousPromise.then(() => new Promise(r => { releaseLock = r; }));
    try {
        await previousPromise;
        return await fn();
    } finally {
        releaseLock();
    }
};

async function test() {
    console.log('Testing single lock');
    await memoryLock('test', 0, async () => {
        console.log('Inside lock');
        await new Promise(r => setTimeout(r, 100));
    });
    console.log('Testing nested lock (deadlock)');
    try {
        let p = memoryLock('test', 0, async () => {
            console.log('Inside outer lock');
            await memoryLock('test', 0, async () => {
                console.log('Inside inner lock');
            });
            console.log('Finished inner lock');
        });
        await Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('Deadlock!')), 500))]);
    } catch(e) {
        console.error(e.message);
    }
}
test();
