import { createMinifier } from '../minify';

it.skip('debug', () => {
    const minifer = createMinifier();

    move(' w: ');
    move(';\n ');

    function move(next: string, last?: boolean) {
        console.log({ move: { next, last }, result: minifer(next, last) });
    }
});
