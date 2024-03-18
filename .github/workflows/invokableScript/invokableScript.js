module.exports = async ({github, context, core}) => {
    console.log("taking a break...");
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("ok that's long enough");
            resolve();
        }, 3000);
    });
}
