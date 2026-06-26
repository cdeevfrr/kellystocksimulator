// TODO
// Make this actually gaussian and use the seed.

const seed = 0
export type RNG = typeof rng
export const rng = {
    gaussian: () => {return Math.random() - .5},
    uniform: () => {return Math.random()}
}