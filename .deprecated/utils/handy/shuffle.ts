export {};

declare global {

    interface Array<T> {
        /**
         * Extends Array implementing the Fisher-Yates shuffle algorithm 
         * (so basically shuffling the elements randomly)
         */
        shuffle(): T[];
    }
}

Array.prototype.shuffle = function<T>(this: T[]): T[] {

  let result = this;

  for(let i = this.length - 1; i > 0;i--) {

    let rnd = Math.floor(Math.random() * (i + 1));
        
        let tmp     = result[i];
        result[i]   = result[rnd];
        result[rnd] = tmp;
    }

    return result;
}