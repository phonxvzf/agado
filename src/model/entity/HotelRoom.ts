interface HotelRoom {
  rno: string;
  rname: string;
  max_cap: number;
  ex_bed: number;
  ex_bed_price: number;
  reserved: boolean;
  rstatus: string;
  price: number;
}

export default HotelRoom;
