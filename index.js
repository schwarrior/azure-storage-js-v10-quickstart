const {
    Aborter,
    AppendBlobURL,
    ContainerURL,
    ServiceURL,
    SharedKeyCredential,
    StorageURL
} = require('@azure/storage-blob');

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const STORAGE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const ACCOUNT_ACCESS_KEY = process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY;

const ONE_MINUTE = 60 * 1000;

async function getBlobNames(aborter, containerURL) {
    let response;
    let marker;
    do {
        response = await containerURL.listBlobFlatSegment(aborter);
        marker = response.marker;
        for(let blob of response.segment.blobItems) {
            console.log(` - ${ blob.name }`);
        }
    } while (marker);
}

async function blobExists(aborter, containerURL, blobName) {
    let response;
    let marker;
    do {
        response = await containerURL.listBlobFlatSegment(aborter);
        marker = response.marker;
        for(let blob of response.segment.blobItems) {
            if (blob.name === blobName) return true;
        }
    } while (marker);
    return false;
}

async function execute() {

    const containerName = "logs";
    //note spaces not allowed in blob name, but uppercase allowed
    const blobName = "My-Fourth-Log.log";

    const content = new Date().toString() + " I am a sample log line\r\n";

    const credentials = new SharedKeyCredential(STORAGE_ACCOUNT_NAME, ACCOUNT_ACCESS_KEY);
    const pipeline = StorageURL.newPipeline(credentials);
    const serviceURL = new ServiceURL(`https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net`, pipeline);
    
    const containerURL = ContainerURL.fromServiceURL(serviceURL, containerName);
    const appendBlobURL = AppendBlobURL.fromContainerURL(containerURL, blobName);
    
    const aborter = Aborter.timeout(30 * ONE_MINUTE);

    const exists = await blobExists(aborter, containerURL, blobName)

    if (!exists) {
        await appendBlobURL.create(aborter, {ifNoneMatch: blobName})
        console.log(`Blob "${blobName}" does not exist. It was created for append.`);
    } else {
        console.log(`Blob "${blobName}" already exists.`);
    }

    await appendBlobURL.appendBlock(aborter, content, content.length)
    console.log(`Blob "${blobName}" append uploaded`);

    console.log(`Blobs in "${containerName}" container:`);
    await getBlobNames(aborter, containerURL);

}

execute().then(() => console.log("Done")).catch((e) => console.log(e));
