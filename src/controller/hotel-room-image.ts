import koa from 'koa';
import { hotelRoomImageRepo, HotelRoomImage }  from '../model/hotel-room-image';
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

const ctrlHotelRoomImage = {
  // After ctrlHotelRoom.getHotelRoom
  getHotelRoomImage: async(ctx: koa.Context, next: () => Promise<any>) => {
    const hotelId = ctx.response.body['hotel_id'];

    for (let i = 0; i < ctx.response.body['rooms'].length; i += 1) {
      const roomId = ctx.response.body['rooms'][i]['room_id'];
      const hotelRoomImageInfo =
        await hotelRoomImageRepo.getHotelRoomImage(hotelId, roomId);
      ctx.response.body['rooms'][i]['imgs'] = hotelRoomImageInfo.map(image => image['img']);
    }

    return next();
  },

  getUserHotelRoomImage: async(ctx: koa.Context, next: () => Promise<any>) => {
    const hotelIdList = ctx.response.body.map(hotel => hotel['hotel_id']);
    const hotelRoomImageInfo = await hotelRoomImageRepo.getByHotelIds(hotelIdList);

    for (const each of ctx.response.body) {
      const hotelId = each['hotel_id'];

      for (let i = 0; i < each['rooms'].length; i += 1) {
        const roomId = each['rooms'][i]['room_id'];
        const currentHotelRoomImageInfo = hotelRoomImageInfo.filter(image =>
          image['hotel_id'] === hotelId && image['room_id'] === roomId);
        each['rooms'][i]['imgs'] = currentHotelRoomImageInfo.map(image => image['img']);
      }
    }

    return next();
  },

  // After ctrlHotelRoom.createHotelRoom
  updateHotelRoomImage: async(ctx: koa.Context, next: () => Promise<any>) => {
    const hotelId = ctx.response.body['hotel_id'];

    await hotelRoomImageRepo.deleteHotelRoomImageByHotelId(hotelId);

    const batchUpload = [];
    const testDir = (process.env.NODE_ENV === 'production') ? '' : 'test/';
    const bucket: Bucket = gcs ? gcs.bucket(process.env.GCS_BUCKET) : null;
    for (let i = 0; i < ctx.request.body['rooms'].length; i += 1) {
      const hotelRoomInfo = ctx.request.body['rooms'][i];
      const roomId = hotelRoomInfo['room_id'];

      for (let idx = 0; idx < hotelRoomInfo['imgs'].length; idx += 1) {
        const image = hotelRoomInfo['imgs'][idx];
        const ext = (image) ?
          image.substr(image.search('/') + 1, image.search(';') - image.search('/') - 1) : null;
        const fname = (image) ? `${testDir}h${hotelId}r${roomId}_${idx}.${ext}` : null;
        const hotelRoomImageInfo: HotelRoomImage = {
          hotel_id: hotelId,
          room_id: roomId,
          img_id: idx,
          img: fname,
        };
        await hotelRoomImageRepo.createHotelRoomImage(hotelRoomImageInfo);

        if (gcs) {
          if (fname != null) {
            const blob = Buffer.from(image.substr(image.search(',') + 1), 'base64');
            batchUpload.push(bucket.file(fname).save(blob, { resumable: false }));
          }
        }
      }
    }

    if (gcs) {
      await Promise.all(batchUpload);
    }

    return next();
  },
};

export default ctrlHotelRoomImage;
