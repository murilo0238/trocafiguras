import getColors from 'get-image-colors';

async function extract() {
    try {
        const colors = await getColors('c:\\Users\\Murilo\\Desktop\\Site wilian\\trocafigurinha\\src\\assets\\logo.png');
        console.log(colors.map(c => c.hex()));
    } catch (e) {
        console.error("Failed", e);
    }
}
extract();
