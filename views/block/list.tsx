
// import react
import shortid from 'shortid';
import SimpleBar from 'simplebar-react';
import InfiniteScroll from 'react-infinite-scroll-component';
import React, { useRef, useState, useEffect } from 'react';
import { Box, Card, Item, CardHeader, CardContent, Typography, CircularProgress } from '@dashup/ui';

// block list
const BlockList = (props = {}) => {
  // use state
  const [id] = useState(shortid());
  const [listeners] = useState([]);
  const [skip, setSkip] = useState(0);
  const [items, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(25);
  const [updated, setUpdated] = useState(new Date());
  const [loading, setLoading] = useState(false);

  // refs
  const scrollRef = useRef();

  // load data
  const loadData = async (newSkip = skip) => {
    // get model page
    const model = props.block.model || props.model;

    // check model page
    if (!model) return {};

    // get model page
    const modelPage = props.dashup.page(model);

    // check model page
    if (!modelPage) return {};

    // get query
    const query = props.getQuery(modelPage);
    
    // list
    return {
      data  : await query.skip(newSkip).limit(limit).listen(),
      total : await props.getQuery(modelPage).count(),
    };
  };

  // on update
  const onUpdate = () => {
    // set updated
    setUpdated(new Date());
  };

  // on next
  const onNext = async () => {
    // set loading
    setSkip(limit + skip);
    setLoading(true);

    // load data
    const { data, total } = await loadData(limit + skip);

    // push to listeners
    listeners.push(data);

    // new data
    const newData = [...(items || []), ...data].reduce((accum, item) => {
      // check found
      if (accum.find((i) => i.get('_id') === item.get('_id'))) return accum;

      // push
      accum.push(item);
      return accum;
    }, []);

    // foreach
    newData.forEach((item) => item.id = item.get('_id'));

    // push data
    setData(newData);
    setTotal(total);
    setLoading(false);
  };

  // use effect
  useEffect(() => {
    // check loading
    if (loading || !props.page) return;

    // set loading
    setData([]);
    setTotal(0);
    setLoading(true);

    // load data
    loadData().then((result) => {
      // on update
      if (result.data?.on) result.data.on('update', onUpdate);

      // foreach
      result.data.forEach((item) => item.id = item.get('_id'));

      // set data
      setData(result.data);
      setTotal(result.total);
      setLoading(false);
    });

    // page listeners
    props.page.on('data.sort', onUpdate);
    props.page.on('user.query', onUpdate);
    props.page.on('user.search', onUpdate);
    props.page.on('user.filter', onUpdate);
    props.page.on('data.filter', onUpdate);

    // return nothing
    return () => {
      // page listeners
      props.page.removeListener('data.sort', onUpdate);
      props.page.removeListener('user.query', onUpdate);
      props.page.removeListener('user.search', onUpdate);
      props.page.removeListener('user.filter', onUpdate);
      props.page.removeListener('data.filter', onUpdate);

      // items
      listeners.forEach((listener) => {
        // remove listener
        listener?.deafen();
        listener?.removeListener('update', onUpdate);
      })
    };
  }, [
    props.block.model || props.model,
    limit,
    JSON.stringify(props.page && props.page.get('data.sort')),
    JSON.stringify(props.page && props.page.get('user.query')),
    JSON.stringify(props.page && props.page.get('user.search')),
    JSON.stringify(props.page && props.page.get('user.filter')),
    JSON.stringify(props.page && props.page.get('data.filter')),
  ]);

  // return jsx
  return (
    <Card sx={ {
      width         : '100%',
      height        : '100%',
      display       : 'flex',
      flexDirection : 'column',
    } }>
      { !!props.block.name && (
        <CardHeader
          title={ props.block.name }
        />
      ) }
      <CardContent sx={ {
        flex    : 1,
        display : 'flex',
      } }>
        <Box flex={ 1 } position="relative">
          <Box position="absolute" top={ 0 } left={ 0 } right={ 0 } bottom={ 0 }>
            <SimpleBar
              style={ {
                height : '100%',
              } }
              ref={ scrollRef } 
              scrollableNodeProps={ {
                id,
              } }
            >
              <InfiniteScroll
                next={ onNext }
                hasMore={ (items || []).length < total }
                dataLength={ (items || []).length }

                loader={ (
                  <Box display="flex" py={ 3 } justifyContent="center" alignItems="center">
                    <CircularProgress />
                  </Box>
                ) }
                endMessage={ (
                  <Typography sx={ {
                    textAlign : 'center',
                  } } gutterBottom>
                    Yay! You have seen it all.
                  </Typography>
                ) }
                scrollableTarget={ id }
              >
                { (items || []).map((item) => {
                  // check item
                  if (!item || !item.get || !item.toJSON) return null;

                  // return jsx
                  return (
                    <Box mb={ 1 } key={ `item-${item.get('_id')}` }>
                      <Item
                        item={ item }
                        page={ props.page }
                        color={ props.item?.get('_id') === item.get('_id') ? 'primary.light' : undefined }
                        dashup={ props.dashup }
                        onItem={ props.onItem }
                        onClick={ props.onClick }
                        variant="outlined"
                        template={ props.block.display }
                        getField={ props.getField }
                      />
                    </Box>
                  );
                }) }
              </InfiniteScroll>
            </SimpleBar>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// export block list
export default BlockList;