// Tiny handshake so the hero intro waits for the preloader to leave the stage.
let done = false;
const listeners = new Set<() => void>();

export function markIntroDone() {
    if (done) return;
    done = true;
    listeners.forEach((fn) => fn());
    listeners.clear();
}

/** Runs `fn` once the preloader has exited (immediately if it already has). Returns an unsubscribe. */
export function onIntroDone(fn: () => void) {
    if (done) {
        fn();
        return () => {};
    }
    listeners.add(fn);
    return () => {
        listeners.delete(fn);
    };
}
