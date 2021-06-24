
// import dependencies
import slug from 'slug';
import { Dropdown } from 'react-bootstrap';
import { Page, Card } from '@dashup/ui';
import { ReactSortable } from 'react-sortablejs';
import PerfectScrollbar from 'react-perfect-scrollbar';
import React, { useState, useEffect } from 'react';

// create board page
const PageBoard = (props = {}) => {
  // groups
  const [form, setForm] = useState(null);
  const [share, setShare] = useState(false);
  const [items, setItems] = useState([]);
  const [groups, setGroups] = useState([]);
  const [config, setConfig] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updated, setUpdated] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // required
  const required = [{
    key   : 'data.model',
    label : 'Model',
  }, {
    key   : 'data.forms.0',
    label : 'Form',
  }, {
    key   : 'data.group',
    label : 'Group',
  }];
  
  // load groups
  const loadGroups = async () => {
    // check groupBy
    if (!props.page.get('data.group')) return;

    // get groupBy field
    const groupBy = (props.getFields() || []).find((f) => f.uuid === props.page.get('data.group'));

    // check groupBy field
    if (!groupBy) return;

    // check if groupBy field has config options
    if (groupBy.options) {
      // return options
      return [...(groupBy.options || [])].map((option) => {
        // check option
        return {
          ...option,

          id  : slug(option.value),
          key : groupBy.name || groupBy.uuid,
        };
      });
    }

    // check if groupBy field is a user field
    if (groupBy.type === 'user') {
      // members
      const members = await eden.router.get(`/app/${props.dashup.get('_id')}/member/query`);

      // return members
      return members.map((member) => {
        // return key
        return {
          id    : slug(member.id),
          key   : groupBy.name || groupBy.uuid,
          label : member.name,
          value : member.id,
        };
      });
    }

    // load other groupBy field by unique in db
    const uniqueGroups = await props.getQuery().count(groupBy.name || groupBy.uuid, true);

    // check counts
    if (uniqueGroups && Object.keys(uniqueGroups).length) {
      // return map
      return Object.keys(uniqueGroups).map((key) => {
        // return key
        return {
          id    : slug(key),
          key   : groupBy.name || groupBy.uuid,
          label : key,
          value : key,
        };
      });
    }

    // return nothing
    return null;
  };

  // load data
  const loadData = async () => {
    // items
    const items = await props.getQuery().listen();

    // return items
    return {
      items  : [...items],
      total  : await props.getQuery().count(),
      listen : items,
    };
  };

  // set tag
  const setTag = async (field, value) => {
    // set tag
    let tags = (props.page.get('user.filter.tags') || []).filter((t) => typeof t === 'object');

    // check tag
    if (tags.find((t) => t.field === field.uuid && t.value === (value?.value || value))) {
      // exists
      tags = tags.filter((t) => t.field !== field.uuid || t.value !== (value?.value || value));
    } else {
      // push tag
      tags.push({
        field : field.uuid,
        value : (value?.value || value),
      });
    }

    // set data
    await props.setUser('filter.tags', tags);
  };

  // set sort
  const setSort = async (column, way = 1) => {
    // let sort
    let sort;

    // check field
    if (
      column && props.page.get('data.sort') &&
      (column.field !== 'custom' && column.field === props.page.get('data.sort.field')) ||
      (column.field === 'custom' && column.sort === props.page.get('data.sort.sort'))
    ) {
      // reverse sort
      if (props.page.get('data.sort.way') === -1) {
        column = null;
      } else {
        way = -1;
      }
    }
    
    // set sort
    if (!column) {
      sort = null;
    } else {
      // create sort
      sort = {
        way,
  
        id    : column.id,
        sort  : column.sort,
        field : column.field,
      };
    }

    // set data
    await props.setData('sort', sort);
  };

  // set search
  const setSearch = (search = '') => {
    // set page data
    props.page.set('user.search', search.length ? search : null);
  };

  // set filter
  const setFilter = async (filter) => {
    // set data
    props.setUser('query', filter, true);
  };

  // get items
  const getItems = (col) => {
    // get field
    const sort  = props.page.get('data.sort') || null;
    const field = props.getField(props.page.get('data.group'));

    // check field
    if (!field || !items) return [];

    // return queries
    return (items || []).filter((row) => {
      // value
      let val = row.get(`${field.name || field.uuid}`);

      // backlog
      if ((!val || !val.length) && col === 'backlog') return true;

      // val
      if (!Array.isArray(val)) val = [val];

      // check col
      return !!val.find((v) => JSON.stringify(col.value) === JSON.stringify(v));
    }).sort((a, b) => {
      // sort order
      let aC = a.get(sort ? sort.key : `_meta.${props.page.get('_id')}.order`) || 0;
      let bC = b.get(sort ? sort.key : `_meta.${props.page.get('_id')}.order`) || 0;

      // check object
      if (aC && typeof aC === 'object' && !(aC instanceof Date)) aC = JSON.stringify(aC);
      if (bC && typeof bC === 'object' && !(bC instanceof Date)) bC = JSON.stringify(bC);

      // check string
      if (typeof aC === 'string' && typeof bC === 'string') {
        // sort way
        if (sort?.way === -1) {
          // comnpare desc
          return bC.toLowerCase().localeCompare(aC.toLowerCase());
        }

        // compare asc
        return aC.toLowerCase().localeCompare(bC.toLowerCase());
      }

      // sort number
      if (sort?.way === -1) {
        if (bC > aC) return 1;
        if (bC < aC) return -1;
      }

      // check order
      if (bC > aC) return -1;
      if (bC < aC) return 1;
      return 0;
    });
  };

  // on end
  const onEnd = async (e, { group }) => {
    // saving
    setSaving(true);

    // get groupBy field
    const groupBy = (props.getFields() || []).find((f) => f.uuid === props.page.get('data.group'));

    // expand event
    const { to, item, newIndex } = e;

    // get target
    const col    = to.getAttribute('id').replace('col-', '');
    const column = groups.find((g) => g === col || g.value === col);

    // find children
    const children = [...(to.childNodes)].map((node) => {
      // check id
      return node.getAttribute && node.getAttribute('data-id');
    }).filter((idX) => idX !== item.getAttribute('data-id'));

    // splice in
    children.splice(newIndex, 0, item.getAttribute('data-id'));
              
    // updates
    const updates = [];

    // loop children
    children.forEach((child, order) => {
      // should update
      let shouldUpdate = false;

      // get item
      const childItem = (items || []).find((t) => {
        // return accumulator
        return t.get('_id') === child;
      });

      // val
      let val = childItem.get(`${groupBy.name || groupBy.uuid}`);

      // val
      if (val && !Array.isArray(val)) val = [val];

      // check column fields
      if (!val.find((v) => JSON.stringify(v) === JSON.stringify(column?.value))) {
        // should update
        shouldUpdate = true;
        
        // push update
        childItem.set(`${groupBy.name || groupBy.uuid}`, column?.value);
      }

      // check order
      if (childItem.get(`_meta.${props.page.get('_id')}.order`) !== order) {
        // should update
        shouldUpdate = true;

        // set order
        childItem.set(`_meta.${props.page.get('_id')}.order`, order);
      }

      // should update
      if (shouldUpdate) updates.push(childItem);
    });

    // saving
    setSaving(false);

    // check updates
    await Promise.all(updates.map((update) => update.save()));
  };

  // use effect
  useEffect(async () => {
    // check require
    if (required.find((r) => !props.page.get(r.key))) return;

    // set loading
    setLoading(true);

    // load groups
    const groups = await loadGroups();
    const { listen, items, total } = await loadData();

    // updated items
    const updateItems = () => {
      // set items
      setItems([...listen]);
    };

    // on update
    listen.on('update', updateItems);
    
    // set items
    setItems(items || []);
    setGroups(groups || []);
    setLoading(false);

    // on update
    const onUpdate = () => {
      setUpdated(new Date());
    };

    // add listener
    props.page.on('data.sort', onUpdate);
    props.page.on('data.group', onUpdate);
    props.page.on('data.filter', onUpdate);
    props.page.on('user.search', onUpdate);
    props.page.on('user.filter.me', onUpdate);
    props.page.on('user.filter.tags', onUpdate);

    // on update
    return () => {
      // remove
      listen.deafen();
      listen.removeListener('update', updateItems);

      // remove listener
      props.page.removeListener('data.sort', onUpdate);
      props.page.removeListener('data.group', onUpdate);
      props.page.removeListener('data.filter', onUpdate);
      props.page.removeListener('user.search', onUpdate);
      props.page.removeListener('user.filter.me', onUpdate);
      props.page.removeListener('user.filter.tags', onUpdate);
    };
  }, [
    props.page.get('_id'),
    props.page.get('type'),
    props.page.get('data.sort'),
    props.page.get('data.group'),
    props.page.get('data.filter'),
    props.page.get('user.search'),
    props.page.get('user.filter.me'),
    props.page.get('user.filter.tags'),
  ]);

  // return jsx
  return (
    <Page { ...props } require={ required } bodyClass="flex-column">

      <Page.Share show={ share } onHide={ (e) => setShare(false) } />
      { !!props.item && <Page.Item show item={ props.item } form={ form } setItem={ props.setItem } onHide={ (e) => props.setItem(null) } /> }
      <Page.Config show={ config } onHide={ (e) => setConfig(false) } />

      <Page.Menu onConfig={ () => setConfig(true) } presence={ props.presence } onShare={ () => setShare(true) }>
        <>
          { props.dashup.can(props.page, 'submit') && !!props.getForms().length && (
            <Dropdown>
              <Dropdown.Toggle variant="primary" id="dropdown-create" className="me-2">
                <i className="fat fa-plus me-2" />
                Create
              </Dropdown.Toggle>

              <Dropdown.Menu>
                { props.getForms().map((form) => {

                  // return jsx
                  return (
                    <Dropdown.Item key={ `create-${form.get('_id')}` } onClick={ (e) => !setForm(form.get('_id')) && props.setItem(new props.dashup.Model()) }>
                      <i className={ `me-2 fa-${form.get('icon') || 'pencil fas'}` } />
                      { form.get('name') }
                    </Dropdown.Item>
                  );
                }) }
              </Dropdown.Menu>
            </Dropdown>
          ) }
        </>
      </Page.Menu>
      <Page.Filter onSearch={ setSearch } onSort={ setSort } onTag={ setTag } onFilter={ setFilter } isString />
      { !required.find((r) => !props.page.get(r.key)) && groups.length && (
        <Page.Body>
          <PerfectScrollbar className="view-columns flex-1">
            { !props.page.get('data.backlog.disabled') && (
              <div data-column="backlog">
                <div className="column-header">
                  { props.page.get('data.backlog.name') || 'Backlog' }
                </div>
                <div className="column-body">
                  <div className="column-body-inner">
                    <div className="h-100 mx--1">
                      <PerfectScrollbar className="task-container h-100 w-100 px-1">
                        { loading ? (
                          <div className="w-100 text-center">
                            <i className="fa fa-spinner fa-spin" />
                          </div>
                        ) : (
                          <ReactSortable
                            id="col-backlog"
                            list={ getItems('backlog') }
                            onEnd={ (e) => onEnd(e, { group : null }) }
                            group={ props.page.get('_id') }
                            setList={ () => {} }
                            className="grid-column-scroll"
                          >
                            { getItems('backlog').map((item, i) => {
                              // return jsx
                              return (
                                <Card
                                  key={ `backlog-item-${item.get('_id')}` }
                                  item={ item }
                                  page={ props.page }
                                  group={ 'backlog' }
                                  dashup={ props.dashup }
                                  onClick={ props.setItem }
                                  template={ props.page.get('data.display') }
                                  getField={ props.getField }
                                  />
                              );
                            }) }
                          </ReactSortable>
                        ) }
                      </PerfectScrollbar>
                    </div>
                  </div>
                </div>
              </div>
            ) }
            
            { groups.map((group, i) => {
              // return jsx
              return (
                <div key={ `group-${(group && group.id) || group}` } data-column={ (group && group.id) || group }>
                  <div className="column-header px-1">
                    { group.label }
                  </div>
                  <div className="column-body">
                    <div className="column-body-inner">
                      <div className="h-100 mx--1">
                        <PerfectScrollbar className="task-container h-100 w-100 px-1">
                          { loading ? (
                            <div className="w-100 text-center">
                              <i className="fa fa-spinner fa-spin" />
                            </div>
                          ) : (
                            <ReactSortable
                              id={ `col-${(group && group.value) || group}` }
                              list={ getItems(group) }
                              onEnd={ (e) => onEnd(e, { group }) }
                              group={ props.page.get('_id') }
                              setList={ () => {} }
                              className="grid-column-scroll"
                            >
                              { getItems(group).map((item, i) => {
                                // return jsx
                                return (
                                  <Card
                                    key={ `${(group && group.id) || group}-item-${item.get('_id')}` }
                                    item={ item }
                                    page={ props.page }
                                    group={ group }
                                    dashup={ props.dashup }
                                    onClick={ props.setItem }
                                    template={ props.page.get('data.display') }
                                    getField={ props.getField }
                                    />
                                );
                              }) }
                            </ReactSortable>
                          ) }
                        </PerfectScrollbar>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }) }

          </PerfectScrollbar>
        </Page.Body>
      ) }
    </Page>
  );
};

// export default board page
export default PageBoard;