import { getRandomBeerList } from '../../api';
import { Beer } from '../../types';
import handle from '../../utils/error';

const fetchData = (): Promise<Beer[]> => {
  return new Promise(async (resolve) => {
    try {
      const { data } = await getRandomBeerList(10);
      resolve(data);
    } catch (error) {
      handle(error);
    }
  });
};

export { fetchData };
