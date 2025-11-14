// frontend/src/types/index.ts

export interface Facility {
  id: number;
  name: string;
  category: string;
  address: string;
  district: string;
  Latitude: number;
  Longitude: number;
  phone?: string;
  website?: string;
  description?: string;
  imageurl?: string;
  postalcode?: number;
  PetFriendly? : boolean;
  PetExclusiveInfo? : string;
  PetSizeLimit? : string;
  PetRestrictions? : string;
  PetExtraFee? : string;
  DayOfWeek? : string;
  Opens? : string;
  Closes? : string;
  HolidayInfo? : string;
  ParkingAvailable? : boolean;
  IsOutdoor? : boolean;
  IsIndoor? : boolean;
  AdmissionFeeInfo? : string;
}

export interface District {
  id: string; // 또는 number
  name: string;
  description?: string;
  popular_services?: string;
  Latitude?: number;  // <-- [추가] DB에 추가한 컬럼
  Longitude?: number; // <-- [추가] DB에 추가한 컬럼
  en_name?: string;
}


export interface User {
  id: number;
  username: string;
  nickname?: string;
  profile_url?: string;
  favorite_hospitals?: number[];
}
