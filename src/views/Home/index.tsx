import { useCallback, useEffect, useState } from 'react';
import { Beer } from '../../types';
import { Link as RouterLink } from 'react-router-dom';
import { Button, Checkbox, Paper, TextField, Link, Pagination, CircularProgress } from '@mui/material';
import styles from './Home.module.css';
import { Bookmark, BookmarkBorder, FavoriteBorder } from '@mui/icons-material';
import { getBeer, getBeerList, getBeerMetaData } from '../../api';
import { useDebouncedCallback } from 'use-debounce';

const DEFAULT_PAGE_LENGTH = 10;
const LOCAL_STORAGE_KEY = 'beerApp.savedList';

const Home = () => {
  const [beerList, setBeerList] = useState<Array<Beer>>([]);
  const [savedList, setSavedList] = useState<Array<Beer>>([]);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [totalPages, setTotalPages] = useState<number>(0);
  const [fetching, setFetching] = useState<boolean>(false);

  const getSavedIds = () => JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');

  const getSavedBeetList = useCallback(async() => {
    const savedListIds = getSavedIds();
    if (savedListIds) {
      //Get beer from API by id
      return await Promise.all(savedListIds.map(async (id: string) =>{
        const {data: savedBeerData} = await getBeer(id);
        return savedBeerData;
      }));
    }
    return [];
  },[]);

  const setBeerData = useCallback(async (page: number, currentSearch = search, isOnPageLoad = false) => {
    const savedBeerList = await getSavedBeetList();
    isOnPageLoad && setSavedList(savedBeerList);
    //Get beer data from API
    const {data} = await getBeerList({page, per_page: DEFAULT_PAGE_LENGTH, sort: 'asc', by_name: currentSearch});
    // In the beer list the ones that are there in savedBeerList, make its isSaved property true
    const beerListWithSaved = data.map((beer: Beer) => {
      const isSaved = savedBeerList.some((savedBeer: Beer) => savedBeer.id === beer.id);
      return {...beer, isSaved};
    });
    setBeerList(beerListWithSaved);
  }, [search, getSavedBeetList]);

  useEffect(() => {
    async function fetchBeers(){
     setBeerData(page, search, true);
     const {data:{total}} = await getBeerMetaData();
     setTotalPages(Math.ceil(total/DEFAULT_PAGE_LENGTH));     
    }
    fetchBeers();
  }, [page, search, setBeerData]);

  const handleBeerSelectChange = (selectedBeer: Beer) => {
      selectedBeer.isSaved = !selectedBeer.isSaved;
      if(selectedBeer.isSaved) {
        //Add selected beer to saved list
        const ids = getSavedIds();
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...ids, selectedBeer.id]));
        setSavedList([...savedList, selectedBeer]);
      } else {
        //Remove selected beer from saved list
        const ids = getSavedIds();
        const idIndex = ids.findIndex((id: string) => id === selectedBeer.id);
        ids.splice(idIndex, 1);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ids));
        const savedListIndex = savedList.findIndex((beer: Beer) => beer.id === selectedBeer.id);
        savedList.splice(savedListIndex, 1);
        setSavedList([...savedList]);
      }
      setBeerData(page);
  };

  const handlePaginationChange = async (event: React.ChangeEvent<unknown>, value: number) => {
    await setBeerData(value);
    setPage(value);
  }

  const removeAllItems = async() => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setSavedList([]);
    await setBeerData(page);
  }

  const onReloadList = async () => {
    setSearch('');
    await setBeerData(1, '');
    setPage(1);
  }

  const debounced =  useDebouncedCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    await setBeerData(1, event.target.value);
    const {data:{total}} = await getBeerMetaData({by_name: event.target.value});
    setPage(1);
    setTotalPages(Math.ceil(total/DEFAULT_PAGE_LENGTH)); 
    setFetching(false);
  }, 500);

  const onSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setFetching(true);
    await debounced(event);
  }

  return (
    <article>
      <section>
        <main>
          <Paper>
            <div className={styles.listContainer}>
              <div className={styles.listHeader}>
                <TextField label='Search for a Beer..' variant='outlined' size='small' value={search} onChange={onSearch}/>
                <Button variant='contained' onClick={onReloadList}>Reload list</Button>
              </div> 
              {fetching && <div className={styles.loading}><CircularProgress/></div>}
              {!fetching && <>
                <ul className={styles.list}>   
                {!beerList.length && <p className={styles.noBeersFound}>Oops! No beers found with that name.</p>}            
                {beerList.map((beer, index) => (
                  <li key={index.toString()}>
                    <Checkbox 
                      icon={<BookmarkBorder />}
                      checkedIcon={<Bookmark />}
                      checked={beer.isSaved}
                      onChange={() => handleBeerSelectChange(beer)}
                    />
                    <Link component={RouterLink} to={`/beer/${beer.id}`}>
                      {beer.name}
                    </Link>
                  </li>
                ))}
                </ul>
                {beerList.length > 0 && <div className={styles.pagination}>
                  <Pagination page={page} count={totalPages} color="primary" onChange={handlePaginationChange} />
                </div>}
              </>}
            </div>
          </Paper>

          <Paper>
            <div className={styles.listContainer}>
              <div className={styles.listHeader}>
                <h3>Saved items</h3>
                <Button variant='contained' size='small' onClick={removeAllItems}>
                  Remove all items
                </Button>
              </div>
              <ul className={styles.list}>
                {savedList.map((beer, index) => (
                  <li key={index.toString()}>
                    <Checkbox disabled icon={<FavoriteBorder />} />
                    <Link component={RouterLink} to={`/beer/${beer.id}`}>
                      {beer.name}
                    </Link>
                  </li>
                ))}
                {!savedList.length && <p>No saved items</p>}
              </ul>
            </div>
          </Paper>
        </main>
      </section>
    </article>
  );
};

export default Home;
