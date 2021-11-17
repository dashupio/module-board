
// import react
import React from 'react';
import { Query, View, TextField, MenuItem, Box, Divider } from '@dashup/ui';

// block list
const BlockListConfig = (props = {}) => {

  // get forms
  const getModels = () => {
    // get forms
    const forms = Array.from(props.dashup.get('pages').values()).filter((page) => {
      // return model pages
      return page.get('type') === 'model' && !page.get('archived');
    });

    // return mapped
    return forms.map((form) => {
      // return values
      return {
        value : form.get('_id'),
        label : form.get('name'),

        selected : (props.model || props.block.model).includes(form.get('_id')),
      };
    });
  };

  // get forms
  const getForms = () => {
    // get forms
    const forms = Array.from(props.dashup.get('pages').values()).filter((page) => {
      // return model pages
      return page.get('type') === 'form' && page.get('data.model') === (props.model || props.block.model) && !page.get('archived');
    });

    // return mapped
    return forms.map((form) => {
      // return values
      return {
        value : form.get('_id'),
        label : form.get('name'),

        selected : (props.block.form || []).includes(form.get('_id')),
      };
    });
  };

  // return jsx
  return (
    <>
      <TextField
        label="List Model"
        value={ props.block.model || props.model }
        select
        onChange={ (e) => props.setBlock(props.block, 'model', e.target.value) }
        fullWidth
        helperText="View List with this model's items."
      >
        { getModels().map((option) => (
          <MenuItem key={ option.value } value={ option.value }>
            { option.label }
          </MenuItem>
        ))}
      </TextField>

      { !!(props.model || props.block.model) && (
        <TextField
          label="List Form"
          value={ props.block.form || props.form }
          select
          onChange={ (e) => props.setBlock(props.block, 'form', e.target.value) }
          fullWidth
          helperText="View Board with this model's items."
        >
          { getForms().map((option) => (
            <MenuItem key={ option.value } value={ option.value }>
              { option.label }
            </MenuItem>
          ))}
        </TextField>
      ) }
      
      <Box my={ 2 }>
        <Divider />
      </Box>

      { !!getModels().filter((f) => f.selected).length && (
        <>
          <View
            type="field"
            view="input"
            mode="handlebars"
            struct="code"
            value={ props.block.display }
            field={ {
              label : 'Item Display',
            } }
            dashup={ props.dashup }
            onChange={ (f, val) => props.setBlock(props.block, 'display', val) }
          />

          <Box my={ 2 }>
            <Divider />
          </Box>

          <Query
            isString

            page={ props.page }
            label="Filter By"
            query={ props.block.filter }
            dashup={ props.dashup }
            fields={ props.getFields() }
            onChange={ (val) => props.setBlock(props.block, 'filter', val) }
            getFieldStruct={ props.getFieldStruct }
          />
        </>
      ) }
    </>
  );
}

// export default
export default BlockListConfig;