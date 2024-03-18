module.exports = async ({github, context, core}) => {
    console.log(`${new Date().toLocaleString()}: taking a break...`);
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`${new Date().toLocaleString()}: ok that's long enough`);
            resolve();
        }, 3000);
    });
}
