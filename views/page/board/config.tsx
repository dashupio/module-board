
// import react
import React, { useState, useEffect } from 'react';
import { ReactSortable } from 'react-sortablejs';
import { View, Query, TextField, Box, Button, Divider, MenuItem, FormControl, FormControlLabel, Switch } from '@dashup/ui';

// timeout
let timeout;

// debounce
const debounce = (fn, to = 200) => {
  // clear and reinit
  clearTimeout(timeout);
  timeout = setTimeout(fn, to);
};

// create page model config
const PageBoardConfig = (props = {}) => {
  // sorted forms
  const [sortedForms, setSortedForms] = useState(props.page.get('data.sorted') || props.page.get('data.forms') || []);

  // get dashboards
  const getModels = () => {
    // get forms
    const models = Array.from(props.dashup.get('pages').values()).filter((page) => {
      // return model pages
      return page.get('type') === 'model' && !page.get('archived');
    });

    // return mapped
    return models.map((model) => {
      // return values
      return {
        value : model.get('_id'),
        label : model.get('name'),

        selected : (props.page.get('data.model') || []).includes(model.get('_id')),
      };
    });
  };

  // get forms
  const getForms = () => {
    // get forms
    const forms = Array.from(props.dashup.get('pages').values()).filter((page) => {
      // return model pages
      return page.get('type') === 'form' && (page.get('data.model') || []).includes(props.page.get('data.model')) && !page.get('archived');
    });

    // return mapped
    return forms.map((form) => {
      // return values
      return {
        value : form.get('_id'),
        label : form.get('name'),

        selected : (props.page.get('data.forms') || []).includes(form.get('_id')),
      };
    });
  };
  
  // get field
  const getField = (tld, types = []) => {
    // return value
    return props.getFields().map((field) => {
      // check type
      if (types.length && !types.includes(field.type)) return;

      // return fields
      return {
        label : field.label || field.name,
        value : field.uuid,

        selected : (props.page.get(`data.${tld}`) || []).includes(field.uuid),
      };
    }).filter((f) => f);
  };

  // set list
  const setSorted = (list = [], withSave = false) => {
    // check list
    list = list.map((l) => {
      // check if string
      if (typeof l === 'string') return l;
      if (typeof l === 'object') return Object.values(l).filter((v) => typeof v === 'string').join('');
    }).filter((l) => l).filter((l) => {
      try {
        return props.dashup.page(l);
      } catch (e) {}
    });

    // filter out removed options
    list = list.filter((s) => (props.page.get('data.forms') || []).includes(s));

    // add missing options
    (props.page.get('data.forms') || []).forEach((option) => {
      // check includes
      if (list.includes(option)) return;

      // push
      list.push(option);
    });

    // set sorted
    if (withSave) {
      props.setData('sorted', Array.from(new Set(list)));
    } else {
      setSortedForms(Array.from(new Set(list)));
    }
  };

  // use effect
  useEffect(() => {
    // set data
    setSorted(sortedForms, true);
  }, [props.page.get('data.forms')]);

  // return jsx
  return (
    <>
      <TextField
        label="Board Model"
        value={ props.page.get('data.model') }
        select
        onChange={ (e) => props.setData('model', e.target.value) }
        fullWidth
        helperText="View Board with this model's items."
      >
        { getModels().map((option) => (
          <MenuItem key={ option.value } value={ option.value }>
            { option.label }
          </MenuItem>
        )) }
      </TextField>

      { !!props.page.get('data.model') && (
        <TextField
          label="Board Form(s)"
          value={ getForms().filter((v) => v.selected).map((f) => f.value) }
          select
          onChange={ (e) => props.setData('forms', e.target.value) }
          fullWidth
          helperText="The forms that this board will filter by."
          SelectProps={ {
            multiple : true,
          } }
        >
          { getForms().map((option) => (
            <MenuItem key={ option.value } value={ option.value }>
              { option.label }
            </MenuItem>
          )) }
        </TextField>
      ) }

      { !!props.page.get('data.model') && !!props.page.get('data.forms.0') && (
        <Box
          sx={ {
            mt            : 2,
            display       : 'flex',
            flexWrap      : 'wrap',
            flexDirection : 'row',
          } }
          list={ sortedForms }
          onEnd={ () => props.setData('sorted', sortedForms) }
          setList={ (list) => setSorted(list) }
          component={ ReactSortable }
        >
          { sortedForms.map((form) => {
            // return jsx
            return (
              <Box key={ form } mr={ 2 } mb={ 1 }>
                <Button variant="contained" color="primary" sx={ {
                  whiteSpace : 'nowrap',
                } }>
                  { props.dashup.page(form)?.get('name') }
                </Button>
              </Box>
            );
          }) }
        </Box>
      ) }

      { !!props.page.get('data.model') && props.getFields && !!props.getFields().length && (
        <>
          <Box my={ 2 }>
            <Divider />
          </Box>

          <FormControl fullWidth>
            <FormControlLabel control={ (
              <Switch defaultChecked={ !props.page.get('data.backlog.disabled') } onChange={ (e) => props.setData('backlog.enabled', !e.target?.checked) } />
            ) } label="Backlog enabled" />
          </FormControl>

          { !props.page.get('data.backlog.disabled') && (
            <TextField
              label="Backlog Name"
              value={ props.page.get('data.backlog.name') || 'Backlog' }
              onChange={ (e) => props.setData('backlog.name', e.target.value) }
              fullWidth
              helperText="The name of the backlog column."
            />
          ) }
            
          <TextField
            label="Group Field"
            value={ props.page.get('data.group') }
            select
            onChange={ (e) => props.setData('group', e.target.value) }
            fullWidth
            helperText="Selecting a tag field will group the grid by this field."
          >
            { getField('group').map((option) => (
              <MenuItem key={ option.value } value={ option.value }>
                { option.label }
              </MenuItem>
            )) }
          </TextField>

          <TextField
            label="Tag Field(s)"
            value={ Array.isArray(props.page.get('data.tag')) ? props.page.get('data.tag') : [props.page.get('data.tag')].filter((f) => f) }
            select
            onChange={ (e) => props.setData('tag', e.target.value) }
            fullWidth
            helperText="Selecting a tag field will allow you to tag tasks."
            SelectProps={ {
              multiple : true,
            } }
          >
            { getField('tag', ['select', 'checkbox']).map((option) => (
              <MenuItem key={ option.value } value={ option.value }>
                { option.label }
              </MenuItem>
            )) }
          </TextField>

          <TextField
            label="User Field(s)"
            value={ Array.isArray(props.page.get('data.user')) ? props.page.get('data.user') : [props.page.get('data.user')].filter((f) => f) }
            select
            onChange={ (e) => props.setData('user', e.target.value) }
            fullWidth
            helperText="Selecting a user field will allow you to assign tasks to that user."
            SelectProps={ {
              multiple : true,
            } }
          >
            { getField('user', ['user']).map((option) => (
              <MenuItem key={ option.value } value={ option.value }>
                { option.label }
              </MenuItem>
            )) }
          </TextField>

          <View
            type="field"
            view="input"
            mode="handlebars"
            struct="code"
            field={ {
              label : 'Item Display',
            } }
            value={ props.page.get('data.display') }
            dashup={ props.dashup }
            onChange={ (field, val) => debounce(() => props.setData('display', val)) }
          />

          <Box my={ 2 }>
            <Divider />
          </Box>
            
          <Query
            isString

            page={ props.page }
            label="Filter By"
            query={ props.page.get('data.filter') }
            dashup={ props.dashup }
            fields={ props.getFields() }
            onChange={ (val) => debounce(() => props.setData('filter', val)) }
            getFieldStruct={ props.getFieldStruct }
          />
        </>
      ) }
    </>
  )
};

// export default
export default PageBoardConfig;