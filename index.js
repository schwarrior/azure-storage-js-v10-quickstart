const {
    Aborter,
    AppendBlobURL,
    BlockBlobURL,
    ContainerURL,
    ServiceURL,
    SharedKeyCredential,
    StorageURL,
    uploadStreamToBlockBlob,
    uploadFileToBlockBlob
} = require('@azure/storage-blob');

const fs = require("fs");
const path = require("path");

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const STORAGE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const ACCOUNT_ACCESS_KEY = process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY;

const ONE_MEGABYTE = 1024 * 1024;
const FOUR_MEGABYTES = 4 * ONE_MEGABYTE;
const ONE_MINUTE = 60 * 1000;

async function showContainerNames(aborter, serviceURL) {

    let response;
    let marker;

    do {
        response = await serviceURL.listContainersSegment(aborter, marker);
        marker = response.marker;
        for(let container of response.containerItems) {
            console.log(` - ${ container.name }`);
        }
    } while (marker);
}

async function uploadLocalFile(aborter, containerURL, filePath) {

    filePath = path.resolve(filePath);

    const fileName = path.basename(filePath);
    const blockBlobURL = BlockBlobURL.fromContainerURL(containerURL, fileName);

    return await uploadFileToBlockBlob(aborter, filePath, blockBlobURL);
}

async function uploadStream(aborter, containerURL, filePath) {

    filePath = path.resolve(filePath);

    const fileName = path.basename(filePath).replace('.md', '-stream.md');
    const blockBlobURL = BlockBlobURL.fromContainerURL(containerURL, fileName);

    const stream = fs.createReadStream(filePath, {
      highWaterMark: FOUR_MEGABYTES,
    });

    const uploadOptions = {
        bufferSize: FOUR_MEGABYTES,
        maxBuffers: 5,
    };

    return await uploadStreamToBlockBlob(
                    aborter, 
                    stream, 
                    blockBlobURL, 
                    uploadOptions.bufferSize, 
                    uploadOptions.maxBuffers);
}

async function showBlobNames(aborter, containerURL) {

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

    //const containerName = "demo";
    //const blobName = "quickstart.txt";
    const containerName = "logs";
    const blobName = "my-second-log.log";

    const content = new Date().toString() + " I am a sample log line\r\n";
    const localFilePath = "./readme.md";

    const credentials = new SharedKeyCredential(STORAGE_ACCOUNT_NAME, ACCOUNT_ACCESS_KEY);
    const pipeline = StorageURL.newPipeline(credentials);
    const serviceURL = new ServiceURL(`https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net`, pipeline);
    
    const containerURL = ContainerURL.fromServiceURL(serviceURL, containerName);
    const blockBlobURL = BlockBlobURL.fromContainerURL(containerURL, blobName);
    const appendBlobURL = AppendBlobURL.fromContainerURL(containerURL, blobName);
    
    const aborter = Aborter.timeout(30 * ONE_MINUTE);

    console.log("Containers:");
    await showContainerNames(aborter, serviceURL);

    // export interface IAppendBlobCreateOptions {
    //     accessConditions?: IBlobAccessConditions;
    //     blobHTTPHeaders?: Models.BlobHTTPHeaders;
    //     metadata?: IMetadata;
    // }
    // export interface IAppendBlobAppendBlockOptions {
    //     accessConditions?: IAppendBlobAccessConditions;
    //     progress?: (progress: TransferProgressEvent) => void;
    //     transactionalContentMD5?: Uint8Array;
    // }
    // export interface IAppendBlobAccessConditions extends IBlobAccessConditions {
    //     appendPositionAccessConditions?: Models.AppendPositionAccessConditions;
    // }
    /**
     * @interface
     * An interface representing AppendPositionAccessConditions.
     * Additional parameters for appendBlock operation.
     *
     */
    // export interface AppendPositionAccessConditions {
    //     /**
    //      * @member {number} [maxSize] Optional conditional header. The max length in
    //      * bytes permitted for the append blob. If the Append Block operation would
    //      * cause the blob to exceed that limit or if the blob size is already greater
    //      * than the value specified in this header, the request will fail with
    //      * MaxBlobSizeConditionNotMet error (HTTP status code 412 - Precondition
    //      * Failed).
    //      */
    //     maxSize?: number;
    //     /**
    //      * @member {number} [appendPosition] Optional conditional header, used only
    //      * for the Append Block operation. A number indicating the byte offset to
    //      * compare. Append Block will succeed only if the append position is equal to
    //      * this number. If it is not, the request will fail with the
    //      * AppendPositionConditionNotMet error (HTTP status code 412 - Precondition
    //      * Failed).
    //      */
    //     appendPosition?: number;
    // }
    
    /*    
     * Creates a 0-length append blob. Call AppendBlock to append data to an append blob.
     * @see https://docs.microsoft.com/rest/api/storageservices/put-blob
     *
     * @param {Aborter} aborter Create a new Aborter instance with Aborter.None or Aborter.timeout(),
     *                          goto documents of Aborter for more examples about request cancellation
     * @param {IAppendBlobCreateOptions} [options]
     * @returns {Promise<Models.AppendBlobsCreateResponse>}
     * @memberof AppendBlobURL
     */
    //create(aborter: Aborter, options?: IAppendBlobCreateOptions): Promise<Models.AppendBlobCreateResponse>;
    /**
     * Commits a new block of data to the end of the existing append blob.
     * @see https://docs.microsoft.com/rest/api/storageservices/append-block
     *
     * @param {Aborter} aborter Create a new Aborter instance with Aborter.None or Aborter.timeout(),
     *                          goto documents of Aborter for more examples about request cancellation
     * @param {HttpRequestBody} body
     * @param {number} contentLength
     * @param {IAppendBlobAppendBlockOptions} [options]
     * @returns {Promise<Models.AppendBlobsAppendBlockResponse>}
     * @memberof AppendBlobURL
     */
    //appendBlock(aborter: Aborter, body: HttpRequestBody, contentLength: number, options?: IAppendBlobAppendBlockOptions): Promise<Models.AppendBlobAppendBlockResponse>;
//     export interface IAppendBlobCreateOptions {
//         accessConditions?: IBlobAccessConditions;
//         blobHTTPHeaders?: Models.BlobHTTPHeaders;
//         metadata?: IMetadata;
//     }
//     export interface IBlobAccessConditions {
//         modifiedAccessConditions?: Models.ModifiedAccessConditions;
//         leaseAccessConditions?: Models.LeaseAccessConditions;
//     }
// /**
//  * @interface
//  * An interface representing ModifiedAccessConditions.
//  * Additional parameters for a set of operations.
//  *
//  */
// export interface ModifiedAccessConditions {
//     /**
//      * @member {Date} [ifModifiedSince] Specify this header value to operate only
//      * on a blob if it has been modified since the specified date/time.
//      */
//     ifModifiedSince?: Date;
//     /**
//      * @member {Date} [ifUnmodifiedSince] Specify this header value to operate
//      * only on a blob if it has not been modified since the specified date/time.
//      */
//     ifUnmodifiedSince?: Date;
//     /**
//      * @member {string} [ifMatch] Specify an ETag value to operate only on blobs
//      * with a matching value.
//      */
//     ifMatch?: string;
//     /**
//      * @member {string} [ifNoneMatch] Specify an ETag value to operate only on
//      * blobs without a matching value.
//      */
//     ifNoneMatch?: string;
// }




    if ( !blobExists (aborter, containerURL, blobName) ) {
        await appendBlobURL.create(aborter, {ifNoneMatch: blobName})
        console.log(`Blob "${blobName}" does not exist. It was created for append.`);
    } else {
        console.log(`Blob "${blobName}" already exists.`);
    }

    await appendBlobURL.appendBlock(aborter, content, content.length)
    console.log(`Blob "${blobName}" append uploaded`);







    // await containerURL.create(aborter);
    // console.log(`Container: "${containerName}" is created`);

    // await blockBlobURL.upload(aborter, content, content.length);
    // console.log(`Blob "${blobName}" is uploaded`);
    
    // await uploadLocalFile(aborter, containerURL, localFilePath);
    // console.log(`Local file "${localFilePath}" is uploaded`);

    // await uploadStream(aborter, containerURL, localFilePath);
    // console.log(`Local file "${localFilePath}" is uploaded as a stream`);

    console.log(`Blobs in "${containerName}" container:`);
    await showBlobNames(aborter, containerURL);

    // const downloadResponse = await blockBlobURL.download(aborter, 0);
    // const downloadedContent = downloadResponse.readableStreamBody.read(content.length).toString();
    // console.log(`Downloaded blob content: "${downloadedContent}"`);

    // await blockBlobURL.delete(aborter)
    // console.log(`Block blob "${blobName}" is deleted`);
    
    // await containerURL.delete(aborter);
    // console.log(`Container "${containerName}" is deleted`);
}

execute().then(() => console.log("Done")).catch((e) => console.log(e));
