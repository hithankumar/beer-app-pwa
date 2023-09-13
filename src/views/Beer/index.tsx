import { useEffect, useState } from 'react';
import { Beer as IBeer } from '../../types';
import { fetchData } from './utils';
import { useParams } from 'react-router-dom';
import styles from './Beer.module.css';
import SportsBarIcon from '@mui/icons-material/SportsBar';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import FlagIcon from '@mui/icons-material/Flag';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import PhoneIcon from '@mui/icons-material/Phone';
import WebIcon from '@mui/icons-material/Web';
import { Grid } from '@mui/material';


interface IconTextProps {
  icon: JSX.Element;
  label?: string;
  content?: string
  title?: string;
  href?: string;
  children: never[];
}

const IconTextContainer = (props: IconTextProps) => {
  return (
    <Grid container direction="row" alignItems="center">
      {!props.href && <Grid item title={`${props.title || ''}`}>{props.icon}</Grid>}
      {
      props.href && <Grid item>
        <a title={`${props.title || ''}`} href={props.href}>{props.icon}</a>
      </Grid>
      }

      <Grid item className={styles.text}>
        <span>{props.label || ''}</span>
        <span>{props.label && ':' }</span>
        <span className={styles.content}>{props.content || ''}</span>
      </Grid>
    </Grid>    
  );
}

const Beer = () => {
  const { id } = useParams();
  const [beer, setBeer] = useState<IBeer>();

  // eslint-disable-next-line
  useEffect(fetchData.bind(this, setBeer, id), [id]);

  return (
    <article className={styles.container}>
      <section>
        <header>
          <Grid container direction="row" alignItems="center">
            <h1 className={styles.heading}>{beer?.name}</h1>
            <div className={styles.beerContact}>
                <IconTextContainer
                  icon={<WebIcon className={styles.icon} color="secondary"></WebIcon>} 
                  title ={`Visit us by clicking here`}
                  href={beer?.website_url}
                >
                </IconTextContainer>
            </div>   
          </Grid>  
        </header>
        <main>
          <IconTextContainer
            icon={<PhoneIcon fontSize='small' className={styles.icon} color="secondary"></PhoneIcon>} 
            label={`Call us at`}
            content={beer?.phone}
          >
          </IconTextContainer>  
          <IconTextContainer
            icon={<FlagIcon color="secondary"></FlagIcon>} 
            label={`We are from`}
            content={beer?.country}
          >
          </IconTextContainer>
          <IconTextContainer
            icon={<LocationCityIcon color="secondary"></LocationCityIcon>} 
            label={`You can come to us at`}
            content={`${beer?.street}, ${beer?.city}, ${beer?.state_province} ${beer?.postal_code}`}
          >
          </IconTextContainer>
          <IconTextContainer
            icon={<AddLocationAltIcon color="secondary"></AddLocationAltIcon>} 
            label={`Or here on your Map`}
            content={`${beer?.longitude}, ${beer?.latitude}`}
          >
          </IconTextContainer>

          <IconTextContainer
            icon={<SportsBarIcon color="secondary"></SportsBarIcon>} 
            label={`Our kind of beer is`}
            content={`${beer?.brewery_type}`}
          >
          </IconTextContainer>
        </main>
      </section>
    </article>
  );
};

export default Beer;
