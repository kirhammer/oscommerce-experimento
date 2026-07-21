<?php
/*
  Strangler-fig mode selection: persists the visitor's choice between the
  legacy view and the modernized (React + REST API) view of the catalog
  pages, following the same session pattern osCommerce uses for 'currency'
  and 'language'.

  ?modern=1 opts into the modernized view, ?modern=0 returns to the legacy
  view; without the parameter the session choice is kept, so the mode
  survives navigation.
*/

  if (isset($HTTP_GET_VARS['modern'])) {
    if ($HTTP_GET_VARS['modern'] == '0') {
      tep_session_unregister('modern_mode');
    } elseif (!tep_session_is_registered('modern_mode')) {
      $modern_mode = '1';
      tep_session_register('modern_mode');
    }
  }

  $in_modern_mode = tep_session_is_registered('modern_mode');
?>
