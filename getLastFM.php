<?php

    // Encode post so stuff works
    $post = urlencode($_GET['search']);
    $url  = "https://ws.audioscrobbler.com/2.0/";
    $url .= "?method=artist.getinfo";
    $url .= "&artist=".$post;
    $url .= "&api_key=a4fa2456aad2cd68975c95fd9f3fc3a6";
    $url .= "&autocorrect=1";
    // print $url;
    // http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=ARTIST&api_key=YOUR_API_KEY

    // Use cURL operation to access info on YouTube
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    $result = curl_exec($ch);
    curl_close($ch);

    $xmlObject = simplexml_load_string($result);
    // print_r($xmlObject);
?>
    <h1><?php echo 'Biography of: '.$xmlObject->artist->name; ?></h1>
<?
    foreach ($xmlObject->artist as $artist) {
    	$thumbnail = $artist->image[2];
        $bio = $artist->bio->summary;
?>
    <div class="item">
		<span class="thumbnail">
			<img src="<?php echo $thumbnail;?>"/>
		</span>
        <span class="title">
            <?php echo $bio ?>
        </span>
	</div>
<?php
    }
?>
