
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
    if (!model) return null;

    // get model page
    const modelPage = props.dashup.page(model);

    // get query
    const query = props.getQuery(modelPage);

    console.log('test', query);
    
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

    // load data
    loadData().then(({ data, total }) => {
      // on update
      data.on('update', onUpdate);

      // set data
      setData(data);
      setLoading(false);
    });

    // return nothing
    return () => {
      // items
      if (!items.removeListener) return;

      // remove listener
      items.deafen();
      items.removeListener('update', onUpdate);
    };
  }, [props.block.model, props.model, skip, limit, props.page && props.page.get('data.filter')]);

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
                tag={ [] }
                item={ item }
                user={ [] }
                page={ props.page }
                dashup={ props.dashup }
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