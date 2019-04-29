import koa from 'koa';
import crypto from 'crypto';
import Hotel from '../model/entity/Hotel';
import { hotelImageRepo, HotelImage }  from '../model/hotel-image';
import { Storage, Bucket } from '@google-cloud/storage';

let gcs = null;
if (process.env.ENABLE_GCS) {
  if (process.env.GCP_PROJECT_ID && process.env.GCS_SERVICE_KEY_PATH && process.env.GCS_BUCKET) {
    gcs = new Storage({
      projectId: process.env.GCP_PROJECT_ID,
      keyFilename: process.env.GCS_SERVICE_KEY_PATH,
    });
  }
}

const ctrlHotelImage = {
  // After ctrlHotel.getHotel
  getHotelImage: async (ctx: koa.Context, next: () => Promise<any>) => {
    const hotelId = ctx.response.body['hotel_id'];
    const hotelImageInfo = await hotelImageRepo.getHotelImage(hotelId);

    ctx.response.body['imgs'] = hotelImageInfo.map(image => image['img']);

    return next();
  },

  getUserHotelImage: async (ctx: koa.Context, next: () => Promise<any>) => {
    const hotelIdList = ctx.response.body.map((hotel: Hotel) => hotel['hotel_id']);
    const hotelImageInfo = await hotelImageRepo.getByHotelIds(hotelIdList);

    for (const each of ctx.response.body) {
      const hotelId = each['hotel_id'];
      const currentHotelImageInfo =
        hotelImageInfo.filter(hotelImage => hotelImage['hotel_id'] === hotelId);

      each['imgs'] = currentHotelImageInfo.map(image => image['img']);
    }

    return next();
  },

  // After ctrlHotel.createHotel
  updateHotelImage: async (ctx: koa.Context, next: () => Promise<any>) => {
    const hotelId = ctx.request.body['hotel_id'];
    const batchUpload = [];
    const testDir = (process.env.NODE_ENV === 'production') ? '' : 'test/';
    const bucket: Bucket = gcs ? gcs.bucket(process.env.GCS_BUCKET) : null;
    for (let idx = 0; idx < ctx.request.body['imgs'].length; idx += 1) {
      const image: string = ctx.request.body['imgs'][idx];
      const isImage = (image != null) && (image.substr(0, 20).search('data:image') >= 0);

      if (gcs) {
        if (isImage) {
          const blob = Buffer.from(image.substr(image.search(',') + 1), 'base64');
          const ext = image.substr(
            image.search('/') + 1,
            image.search(';') - image.search('/') - 1,
          );
          const fname = `${testDir}${crypto.randomBytes(16).toString('hex')}.${ext}`;
          ctx.request.body['imgs'][idx] = fname;
          batchUpload.push(bucket.file(fname).save(blob, { resumable: false }));
        }
      }
    }

    const hotelImageInfo: HotelImage = {
      hotel_id: hotelId,
      img: ctx.request.body['imgs'].toString(),
    };
    await hotelImageRepo.createHotelImage(hotelImageInfo);

    if (gcs) {
      await Promise.all(batchUpload);
    }

    return next();
  },
};

export default ctrlHotelImage;
