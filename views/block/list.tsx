
// import react
import FlatList from 'flatlist-react';
import React, { useState, useEffect } from 'react';
import { Box, Card, Item, CardHeader, CardContent, CircularProgress } from '@dashup/ui';

// block list
const BlockList = (props = {}) => {
  // use state
  const [skip, setSkip] = useState(0);
  const [items, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(25);
  const [updated, setUpdated] = useState(new Date());
  const [loading, setLoading] = useState(false);

  // load data
  const loadData = async () => {
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
      data  : await query.skip(skip).limit(limit).listen(),
      total : await props.getQuery(modelPage).count(),
    };
  };

  // on update
  const onUpdate = () => {
    // set updated
    setUpdated(new Date());
  };

  // use effect
  useEffect(() => {
    // check loading
    if (loading) return;

    // set loading
    setLoading(true);

    // listening
    let listening = null;

    // load data
    loadData().then(({ data = [], total = 0 }) => {
      // on update
      if (data?.on) data.on('update', onUpdate);

      // listening
      listening = data;

      // set data
      setData(skip ? [...data, data] : data);
      setTotal(total);
      setLoading(false);
    });

    // return nothing
    return () => {
      // items
      if (!listening.removeListener) return;

      // remove listener
      listening.deafen();
      listening.removeListener('update', onUpdate);
    };
  }, [
    props.block.model || props.model,
    skip,
    limit,
    JSON.stringify(props.page && props.page.get('data.sort')),
    JSON.stringify(props.page && props.page.get('user.filter')),
    JSON.stringify(props.page && props.page.get('data.filter')),
  ]);

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
            <FlatList
              list={ items }
              renderItem={ (item) => {
                // return jsx
                return (
                  <Item
                    key={ `item-${item.get('_id')}` }
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
                );
              } }
              renderWhenEmpty={ () => (
                <Box justifyContent="center" display="flex" my={ 2 }>
                  <CircularProgress />
                </Box>
              ) }
              hasMoreItems={ items.length < total }
              loadMoreItems={ () => setSkip(skip + limit) }
              paginationLoadingIndicator={ (
                <Box justifyContent="center" display="flex" my={ 2 }>
                  <CircularProgress />
                </Box>
              ) }
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// export block list
export default BlockList;