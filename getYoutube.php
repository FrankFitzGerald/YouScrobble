<?php
    //Function to convert Seconds to Minutes
      function minutes( $seconds )
      {
          return sprintf( "%02.2d:%02.2d", floor( $seconds / 60 ), $seconds % 60 );
      }
?>

<?php
    // Encode post so stuff works
    $post = urlencode($_POST['search']);
    $nospaces = str_replace('+','', $post);
    $url  = "https://developers.google.com/apis-explorer/#p/youtube/v3/youtube.search.list?part=snippet&order=viewCount&";
    $url .= "?q=".$post .= "&type=video&videoDefinition=high";
    // $url .= "&author=".$nospaces;
    // print $url;
    // http://gdata.youtube.com/feeds/api/videos/-/Music/-cover/-teaser/-Cover/-Teaser/-trailer/-Trailer/-gig/-Gig/-fuse/-Golden/-God/-Awards?q=SOME_ARTIST

    // Use cURL operation to access info on YouTube
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    $result = curl_exec($ch);
    curl_close($ch);

    $xmlObject = simplexml_load_string($result);
    // $xmlObject = simplexml_load_file($url);
    // print_r($xmlObject);
?>
    <h1><?php echo $xmlObject->title; ?></h1>
    <ul class="content">
<?
    foreach ($xmlObject->entry as $entry) {
      // get nodes in media: namespace for media information
      $media = $entry->children('http://search.yahoo.com/mrss/');

      // get video player URL for YouTube
      $attrs = $media->group->player->attributes();
      $watch = $attrs['url'];

      //get video player URL for My Page
      // $attrs = $media->group->content->attributes();
      // $videoURL = $attrs['url'];

      // get video ID
      $arr = explode('/',$entry->id);
      $videoID = $arr[count($arr)-1];

      // get video thumbnail
      $attrs = $media->group->thumbnail[0]->attributes();
      $thumbnail = $attrs['url'];

      // get <yt:duration> node for video length
      $yt = $media->children('http://gdata.youtube.com/schemas/2007');
      $attrs = $yt->duration->attributes();
      $length = $attrs['seconds'];


      // get <yt:stats> node for viewer statistics
      $yt = $entry->children('http://gdata.youtube.com/schemas/2007');
      $attrs = $yt->statistics->attributes();
      $viewCount = $attrs['viewCount'];

      // get <gd:rating> node for video ratings
      $gd = $entry->children('http://schemas.google.com/g/2005');
      if ($gd->rating) {
        $attrs = $gd->rating->attributes();
        $rating = $attrs['average'];
      } else {
        $rating = 0;
      }
?>
      <li>
        <span class="title">
          <!-- <a href="<?php echo $watch; ?>"><?php echo $media->group->title; ?></a> -->
          <a href="http://www.youtube.com/embed/<?php echo $videoID; ?>"><?php echo $media->group->title; ?></a>
        </span>
<!--      <object width="425" height="350">
      <param name="movie" value="<?php echo $videoURL; ?>"></param>
      <param name="wmode" value="transparent"></param>
      <embed src="<?php echo $videoURL; ?>" type="application/x-shockwave-flash" wmode="transparent"
      width="425" height="350"></embed>
    </object> -->
      <iframe class="youtube-player" type="text/html" width="425" height="350" src="http://www.youtube.com/embed/<?php echo $videoID; ?>" frameborder="0" allowfullscreen="true">
      </iframe>
      <p>
<!--         <span class="thumbnail">
          <a href="<?php echo $watch; ?>"><img src="<?php echo $thumbnail;?>" />click to view</a>
          <br/>
        </span>  -->
        <span class="attr">By:</span> <?php echo $entry->author->name; ?> <br/>
        <span class="attr">Duration:</span> <?php echo minutes($length);?>
        minutes <br/>
        <span class="attr">Views:</span> <?php echo number_format((int) $viewCount); ?> <br/>
        <span class="attr">Rating:</span> <?php printf('%.2f', $rating); ?>
      </p>
      <p><?php echo $media->group->description; ?></p>
    </li>

<?php
}
?>
    </ul>
