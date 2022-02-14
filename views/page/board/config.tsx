
// import react
import React from 'react';
import { View, Query, TextField, Box, Divider, MenuItem, FormControl, FormControlLabel, Switch } from '@dashup/ui';

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
      return page.get('type') === 'form' && page.get('data.model') === props.page.get('data.model') && !page.get('archived');
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

  // on forms
  const onModel = (value) => {
    // set data
    props.setData('model', value?.value);
  };

  // on forms
  const onField = (tld, value) => {
    // set data
    props.setData(tld, value || null);
  };

  // on forms
  const onForms = (value) => {
    // set data
    props.setData('forms', value.map((v) => v.value));
  };

  // on backlog
  const onBacklog = (e) => {
    // set data
    props.setData('backlog.disabled', !e.target.checked);
  };

  // on backlog name
  const onBacklogName = (e) => {
    // set data
    props.setData('backlog.name', e.target.value);
  };

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
          value={ Array.isArray(props.page.get('data.forms')) ? props.page.get('data.forms') : [props.page.get('data.forms')].filter((f) => f) }
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