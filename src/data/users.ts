import usersJson from './users.json';
import pimecrolimusAvgJson from './pimecrolimus_avg.json';

export const usersData = usersJson as Record<
  string,
  {
    name: string;
    region: string;
    province: string;
    products: Record<
      string,
      {
        type: '新产品' | '存量产品';
        nameS: string;
        nameJ: string;
        nameT: string;
        hospitals: Record<
          string,
          {
            name: string;
            targets: Record<string, number>;
          }
        >;
      }
    >;
    hospitals: string[];
    pimecrolimus_avg_total: number;
  }
>;

export const pimecrolimusAvg = pimecrolimusAvgJson as Record<string, number>;
