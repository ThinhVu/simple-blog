<script>
import {ref, computed} from 'vue';
import {parseContent} from '@/logic/utils';
import Tooltip from '@/components/UiLib/Tooltip';

export default {
  components: {Tooltip},
  props: {value: String},
  setup(props) {
    const lines = computed(() => (props.value || '').split('\n'));
    const showExpand = computed(() => lines.value.length > 5);
    const tokenizedLines = computed(() => lines.value.map(line => parseContent(line)))
    const visibleTokenizedLines = computed(() => {
      if (!showExpand.value)
        return tokenizedLines.value
      else if (expand.value) {
        return tokenizedLines.value
      } else {
        return tokenizedLines.value.slice(0, 5)
      }
    })
    const expand = ref(false)
    const renderLine = tokens => {
      return <div>
        {tokens.map(token => {
          switch (token.type) {
            case 'text':
              return token.value;
            case 'href':
              return <a href={token.value.href} target="_blank">{token.value.text}</a>;
            case 'ref':
              return <span class="fw-6" style="background: #aaa; padding: 3px 3px; border-radius: 3px;">
                {token.value.fullName}
              </span>;
          }
        })}
      </div>
    }
    const renderContent = () => {
      return <div class="fc" style="font-size: 14px; line-height: 20px">
        {visibleTokenizedLines.value.map(renderLine)}
        {(showExpand.value && !expand.value) && <span class="fw-6" onClick={() => expand.value = true}>...See more</span>}
      </div>
    }

    return {
      lines,
      showExpand,
      tokenizedLines,
      visibleTokenizedLines,
      expand,
      renderContent,
    }
  },
  render() {
    return this.renderContent()
  }
}
</script>
