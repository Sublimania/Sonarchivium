(function(){
    const queueContainer=document.createElement('div');queueContainer.id='audio-player-queue';
    queueContainer.innerHTML='<h3>Playback Queue</h3><ul></ul>';
    document.body.appendChild(queueContainer);
    const list=queueContainer.querySelector('ul');
    let queue=[],currentIndex=-1;
    function render(){
      list.innerHTML='';
      queue.forEach((item,i)=>{
        const li=document.createElement('li');
        li.innerHTML=`<span class="title">${item.name}</span>
          <button class="move-up" ${i===0?'disabled':''}>▲</button>
          <button class="move-down" ${i===queue.length-1?'disabled':''}>▼</button>
          <button class="remove">✕</button>`;
        li.querySelector('.move-up').onclick=e=>{
          e.stopPropagation();
          [queue[i-1],queue[i]]=[queue[i],queue[i-1]];
          if (currentIndex===i) currentIndex=i-1; else if(currentIndex===i-1) currentIndex=i;
          render();window.onQueueChange(queue,currentIndex);
        };
        li.querySelector('.move-down').onclick=e=>{
          e.stopPropagation();
          [queue[i+1],queue[i]]=[queue[i],queue[i+1]];
          if (currentIndex===i) currentIndex=i+1; else if(currentIndex===i+1) currentIndex=i;
          render();window.onQueueChange(queue,currentIndex);
        };
        li.querySelector('.remove').onclick=e=>{
          e.stopPropagation();
          queue.splice(i,1);
          if(currentIndex>=queue.length)currentIndex=queue.length-1;
          render();window.onQueueChange(queue,currentIndex);
        };
        li.onclick=()=>{
          currentIndex=i;render();window.onQueueChange(queue,currentIndex);
        };
        if(i===currentIndex)li.style.backgroundColor='rgba(140,77,199,0.2)';
        list.appendChild(li);
      });
    }
    window.audioQueue={
      add(item){queue.push(item);if(currentIndex<0)currentIndex=0;render();window.onQueueChange(queue,currentIndex);},
      prev(){if(currentIndex>0)currentIndex--,render(),window.onQueueChange(queue,currentIndex);},
      next(){if(currentIndex<queue.length-1)currentIndex++,render(),window.onQueueChange(queue,currentIndex);},
      getQueue(){return queue.slice();},
      getCurrentIndex(){return currentIndex;},
      setCurrent(i){if(i>=0&&i<queue.length)currentIndex=i,render(),window.onQueueChange(queue,currentIndex);},
    };
    render();
  })();
  