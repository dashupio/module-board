
// import dependencies
import slug from 'slug';
import { ReactSortable } from 'react-sortablejs';
import PerfectScrollbar from 'react-perfect-scrollbar';
import React, { useState, useEffect } from 'react';
import { Box, Badge, Stack, Typography, Page, Item, Button, Icon, CircularProgress } from '@dashup/ui';

// timeout
let timeout;

// debounce
const debounce = (fn, to = 200) => {
  // clear
  clearTimeout(timeout);
  timeout = setTimeout(fn, to);
};

// create board page
const PageBoard = (props = {}) => {
  // groups
  const [share, setShare] = useState(false);
  const [groups, setGroups] = useState([]);
  const [config, setConfig] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updated, setUpdated] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [colLoading, setColLoading] = useState([]);

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

  // get query
  const getQuery = (group) => {
    // items
    let query = props.getQuery();

    // group
    if (group.value) {
      // add where
      query = query.where({
        [group.key] : group.value,
      });
    } else {
      // or
      query = query.or({
        [group.key] : null,
      }, {
        [group.key] : 'backlog',
      });
    }

    // return query
    return query;
  };

  // updated
  const onUpdated = () => {
    // set updated
    debounce(() => setUpdated(new Date()));
  };

  // updated
  const onGroup = async (group) => {
    // set items
    group.items = [...group.listens].reduce((accum, listen) => {
      // loop
      listen.forEach((item) => {
        // check item
        if (!accum.find((i) => i.get('_id') === item.get('_id'))) {
          accum.push(item);
        }
      });

      // return accum
      return accum;
    }, []);
  };

  // on group count
  const onGroupCount = async (group) => {
    group.total = await getQuery(group.group).count();
  };

  // load data
  const loadData = async (group, skip = 0) => {
    // result
    const result = await getQuery(group).skip(skip).limit(25).listen();

    // return items
    return {
      group,
      total   : await getQuery(group).count(),
      items   : [...result],
      limit   : 25,
      listens : [result],
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
  const sortItems = (group, items) => {
    // get field
    const sort      = props.page.get('data.sort') || null;
    const field     = props.getField(props.page.get('data.group'));
    const sortField = sort?.field && props.getField(sort.field);

    // check field
    if (!field || !items) return [];

    // return queries
    return (items || []).filter((item) => {
      // get value
      let actualValue = item.get(field.name || field.uuid);

      // check value
      if (!Array.isArray(actualValue)) actualValue = [actualValue].filter((v) => v);

      // check item
      actualValue = actualValue.map((v) => v._id || v.id || (v.get && v.get('_id')) || v);
      
      // check group
      if ((!group || (group?.id || 'backlog') === 'backlog') && !actualValue.length) return true;

      // return value
      return actualValue.includes(group.value);
    }).reduce((accum, item) => {
      // check accum
      if (accum.find((i) => i.get('_id') === item.get('_id'))) return accum;
      accum.push(item);

      // return accum
      return accum;
    }, []).sort((a, b) => {
      // sort order
      let aC = a.get(sortField ? (sortField.name || sortField.uuid) : `_meta.${props.page.get('_id')}.order`) || 0;
      let bC = b.get(sortField ? (sortField.name || sortField.uuid) : `_meta.${props.page.get('_id')}.order`) || 0;

      // check array
      if (Array.isArray(aC)) aC = aC[0];
      if (Array.isArray(bC)) bC = bC[0];

      // check object
      if (aC && typeof aC === 'object' && !(aC instanceof Date)) aC = JSON.stringify(aC);
      if (bC && typeof bC === 'object' && !(bC instanceof Date)) bC = JSON.stringify(bC);

      // check string
      if (typeof aC === 'string' && typeof bC === 'string') {
        // sort way
        if (sort?.way === -1) {
          // comnpare desc
          return `${bC}`.toLowerCase().localeCompare(`${aC}`.toLowerCase());
        }

        // compare asc
        return `${aC}`.toLowerCase().localeCompare(`${bC}`.toLowerCase());
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

  // on scroll
  const onScroll = async (group) => {
    // find column
    const column = groups.find((g) => g.group?.value === group?.value || (!g.group?.value && !group?.value));

    // check column
    if (!column) return;

    // check column total
    if (column.total <= column.limit) return;

    // check already loading
    if (colLoading.includes(group?.value || 'backlog')) return;

    // push loading
    setColLoading([...colLoading, group?.value || 'backlog']);

    // load actual items
    const skip = column.limit;
    const limit = 25;

    // add to column
    column.limit = skip + limit;

    // load new items
    const { items, total, listens } = await loadData(group, skip);

    // set total
    column.total = total;

    // push missing items
    items.forEach((item) => {
      // found
      const found = column.items.find((i) => i.get('_id') === item.get('_id'));

      // push item
      if (!found) column.items.push(item);
    });

    // update
    column.listens.push(listens[0]);

    // add listener
    if (column.onUpdate) listens[0].on('update', column.onUpdate);

    // set groups
    setGroups([...groups]);

    // push loading
    setColLoading(colLoading.filter((c) => c !== (group?.value || 'backlog')));
  };

  // on end
  const onEnd = async (e, { group }) => {
    // saving
    setSaving(true);

    // get items
    const items = groups.reduce((accum, { items }) => {
      // push
      accum.push(...items);

      // return accum
      return accum;
    }, []);

    // get groupBy field
    const groupBy = (props.getFields() || []).find((f) => f.uuid === props.page.get('data.group'));

    // expand event
    const { to, item, newIndex } = e;

    // get target
    const col    = to.getAttribute('id').replace('col-', '');
    const column = groups.find((g) => g.group?.value === col || (!g.group?.value && col === 'backlog'));

    // find children
    const children = [...(to.childNodes)].map((node) => {
      // check id
      return node.getAttribute && node.getAttribute('id');
    }).filter((idX) => idX !== item.getAttribute('id'));

    // splice in
    children.splice(newIndex, 0, item.getAttribute('id'));
              
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
      if (!Array.isArray(val)) val = [val].filter((v) => v);

      // check column fields
      if (!val.find((v) => JSON.stringify(v) === JSON.stringify(column?.group?.value))) {
        // should update
        shouldUpdate = true;
        
        // push update
        childItem.set(`${groupBy.name || groupBy.uuid}`, column?.group?.value || null);

        // move child
        const oldCol = groups.find((g) => g?.group?.value === val[0] || (g.type === 'backlog' && !val[0]));

        // if old col
        if (oldCol) {
          oldCol.items = oldCol.items.filter((i) => i.get('_id') !== childItem.get('_id'));
        }
        
        // push item
        column.items.push(childItem);
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

    // check groups
    if (!groups || !groups.length) return;

    // load groups
    if (!props.page.get('data.backlog.disabled')) {
      // unshift
      groups.unshift({
        key   : groups[0].key,
        type  : 'backlog',
        value : null,
      });
    }

    // create group listens
    const datas = await Promise.all(groups.map((g) => loadData(g)));
    
    // set groups
    setGroups(datas || []);
    setLoading(false);

    // add listener
    datas.forEach((data) => {
      // on update
      data.onUpdate = () => {
        // on group
        onGroup(data).then(onUpdated);
        onGroupCount(data).then(onUpdated);
      };

      // listens
      data.listens.forEach((listen) => {
        // add individual listener
        listen.on('update', data.onUpdate);
      });
    });

    // add listener
    props.page.on('data.sort', onUpdated);
    props.page.on('data.group', onUpdated);
    props.page.on('data.filter', onUpdated);
    props.page.on('user.search', onUpdated);
    props.page.on('user.filter.me', onUpdated);
    props.page.on('user.filter.tags', onUpdated);

    // on update
    return () => {
      // add listeners
      datas.forEach((data) => {
        // loop listens
        (data.listens || []).forEach((listen) => {
          // check listen
          if (listen?.removeListener) {
            listen.deafen();
            listen.removeListener('update', data.onUpdate);
          }
        });
      });

      // remove listener
      props.page.removeListener('data.sort', onUpdated);
      props.page.removeListener('data.group', onUpdated);
      props.page.removeListener('data.filter', onUpdated);
      props.page.removeListener('user.search', onUpdated);
      props.page.removeListener('user.filter.me', onUpdated);
      props.page.removeListener('user.filter.tags', onUpdated);
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
      { !!props.item && <Page.Item show item={ props.item } setItem={ props.setItem } onHide={ (e) => props.setItem(null) } /> }
      <Page.Config show={ config } onHide={ (e) => setConfig(false) } />

      <Page.Menu onConfig={ () => setConfig(true) } presence={ props.presence } onShare={ () => setShare(true) }>
        <>
          { props.dashup.can(props.page, 'submit') && !!props.getForms().length && (
            <Button color="primary" variant="contained" onClick={ (e) => props.setItem(new props.dashup.Model({}, props.dashup)) } startIcon={ (
              <Icon type="fas" icon={ props.getForms()[0].get('icon') } />
            ) }>
              { props.getForms()[0].get('name') }
            </Button>
          ) }
        </>
      </Page.Menu>
      <Page.Filter onSearch={ setSearch } onSort={ setSort } onTag={ setTag } onFilter={ setFilter } isString />
      { !!groups?.length ? (
        <Page.Body>
          <Box flex={ 1 } position="relative">
            <Box position="absolute" top={ 0 } left={ 0 } right={ 0 } bottom={ 0 }>
              <PerfectScrollbar style={ {
                width  : '100%',
                height : '100%',
              } }>
                <Stack direction="row" spacing={ 2 } sx={ {
                  height : '100%',
                } }>
                  { groups.map(({ group, items, total }, i) => {
                    // return jsx
                    return (
                      <Box key={ `group-${group?.id || 'backlog'}` } data-column={ group?.id || 'backlog' } width={ 320 } height="100%" display="flex" flexDirection="column">
                        <Badge badgeContent={ total || 0 } color="primary" sx={ {
                          '& .MuiBadge-badge': {
                            top     : 13,
                            right   : '10px',
                            padding : '0 4px',
                          },
                        } }>
                          <Box mb={ 3 }>
                            <Typography variant="h5">
                              { group.label || props.page.get('data.backlog.name') || 'Backlog' }
                            </Typography>
                          </Box>
                        </Badge>
                        <Box flex={ 1 } position="relative">
                          <Box position="absolute" top={ 0 } left={ 0 } right={ 0 } bottom={ 0 }>
                            { loading ? (
                              <Box flex={ 1 } alignItems="center" justifyContent="center">
                                <CircularProgress />
                              </Box>
                            ) : (
                              <PerfectScrollbar style={ {
                                height   : '100%',
                                position : 'relative',
                              } } onYReachEnd={ () => onScroll(group) }>
                                <ReactSortable
                                  id={ `col-${group?.value || 'backlog'}` }
                                  list={ sortItems(group, items) }
                                  onEnd={ (e) => onEnd(e, { group }) }
                                  group={ props.page.get('_id') }
                                  setList={ () => {} }
                                  className="column-scroll"
                                >
                                  { sortItems(group, items).map((item, i) => {
                                    // return jsx
                                    return (
                                      <Box mb={ 2 } id={ item.get('_id') } key={ `${group?.id || group?.key || group}-item-${item.get('_id')}` }>
                                        <Item
                                          item={ item }
                                          page={ props.page }
                                          group={ group }
                                          dashup={ props.dashup }
                                          onClick={ props.setItem }
                                          template={ props.page.get('data.display') }
                                          getField={ props.getField }
                                        />
                                      </Box>
                                    );
                                  }) }
                                </ReactSortable>
                                { !!colLoading.includes(group?.value || 'backlog') && (
                                  <CircularProgress />
                                ) }
                              </PerfectScrollbar>
                            ) }
                          </Box>
                        </Box>
                      </Box>
                    )
                  }) }
                </Stack>
              </PerfectScrollbar>
            </Box>
          </Box>
        </Page.Body>
      ) : (
        <Box flex={ 1 } alignItems="center" justifyContent="center">
          <CircularProgress />
        </Box>
      ) }
    </Page>
  );
};

// export default board page
export default PageBoard;