import koa from 'koa';
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
    const hotelIdList = ctx.response.body.map(hotel => hotel['hotel_id']);
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

    await hotelImageRepo.deleteHotelImageByHotelId(hotelId);

    const batchUpload = [];
    const testDir = (process.env.NODE_ENV === 'production') ? '' : 'test/';
    const bucket: Bucket = gcs ? gcs.bucket(process.env.GCS_BUCKET) : null;
    for (let idx = 0; idx < ctx.request.body['imgs'].length; idx += 1) {
      const image = ctx.request.body['imgs'][idx];
      const fname = (image) ? `${testDir}h${hotelId}_${idx}` : null;
      const hotelImageInfo: HotelImage = {
        hotel_id: hotelId,
        img_id: idx,
        img: fname,
      };
      await hotelImageRepo.createHotelImage(hotelImageInfo);

      if (gcs) {
        if (fname != null) {
          batchUpload.push(bucket.file(fname).save(image, { resumable: false }));
        }
      }
    }

    if (gcs) {
      await Promise.all(batchUpload);
    }

    return next();
  },
};

export default ctrlHotelImage;
