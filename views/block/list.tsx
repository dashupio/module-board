
// import react
import { Card } from '@dashup/ui';
import ReactPerfectScrollbar from 'react-perfect-scrollbar';
import React, { useState, useEffect } from 'react';

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
      setData(data);
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

  // return jsx
  return (
    <div className={ `flex-1 d-flex flex-column h-100 w-100${props.block.background ? ' card' : ''}` }>
      { !!props.block.label && (
        <div className={ props.block.background ? 'card-header' : 'mb-2' }>
          <b>{ props.block.label }</b>
        </div>
      ) }
      { !!skip && (
        <div className={ props.block.background ? 'card-header' : 'mb-2' }>
          <button className="btn btn-primary w-100" onClick={ (e) => onPrev(e) }>
            { loading ? 'Loading...' : 'Prev' }
          </button>
        </div>
      ) }
      { !!loading && (
        <div className={ `text-center${props.block.background ? ' card-body' : ''}` }>
          <i className="fa fa-spinner fa-spin" />
        </div>
      ) }
      { !loading && (
        <ReactPerfectScrollbar className={ `flex-column flex-1${props.block.background ? ' card-body' : ''} p-relative` }>
          { items.map((item, i) => {
            // return jsx
            return (
              <Card
                key={ `block-${props.block.uuid}-${item.get('_id')}` }
                item={ item }
                page={ props.page }
                dashup={ props.dashup }
                onItem={ props.onItem }
                onClick={ props.onClick }
                template={ props.block.display }
                getField={ props.getField }
                />
            );
          }) }
        </ReactPerfectScrollbar>
      ) }
      { (total - skip - limit) > 0 && (
        <div className={ props.block.background ? 'card-footer' : 'mt-2' }>
          <button className="btn btn-primary w-100" onClick={ (e) => onNext(e) }>
            { loading ? 'Loading...' : 'Next' }
          </button>
        </div>
      ) }
    </div>
  );
};

// export block list
export default BlockList;